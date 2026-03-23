const Review = require("../models/Review");
const Listing = require("../models/Listing");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────────────────────
// HELPER: Compute aggregate rating stats from reviews array
// ─────────────────────────────────────────────────────────────
function computeRatingStats(reviews) {
  const total = reviews.length;
  if (total === 0) return null;

  const overall = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

  // Sub-category averages (only from reviews that have them)
  const subCategories = ["cleanliness", "comfort", "location", "facilities", "valueForMoney"];
  const subRatings = {};

  for (const cat of subCategories) {
    const withCat = reviews.filter((r) => r.ratings?.[cat] != null);
    if (withCat.length > 0) {
      subRatings[cat] = +(
        withCat.reduce((sum, r) => sum + r.ratings[cat], 0) / withCat.length
      ).toFixed(1);
    }
  }

  // Distribution: how many reviews per star (1–5)
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    const star = Math.round(r.rating);
    if (distribution[star] !== undefined) distribution[star]++;
  });

  return {
    totalReviews: total,
    overallRating: +overall.toFixed(1),
    subRatings,
    distribution,
  };
}

// ─────────────────────────────────────────────────────────────
// HELPER: Ask Groq to generate a structured review summary
// ─────────────────────────────────────────────────────────────
async function generateSummaryWithGroq(listingTitle, reviews, stats) {
  // Prepare a clean comment list (max 30 to stay within tokens)
  const comments = reviews
    .filter((r) => r.comment && r.comment.trim().length > 5)
    .slice(0, 30)
    .map((r) => `[Rating: ${r.rating}/5] ${r.comment.trim()}`);

  if (comments.length === 0) {
    return null; // No comments to summarize
  } 

  const systemPrompt = `You are a hotel review analyst. Your job is to read guest reviews for a hotel and generate a structured, honest, and helpful summary that helps potential guests decide if this hotel suits them.

Always respond with ONLY a valid JSON object — no markdown, no explanation, no extra text. The JSON must match this exact structure:
{
  "overallSentiment": "positive" | "mixed" | "negative",
  "headline": "<one punchy sentence summarizing the hotel>",
  "summary": "<3-4 sentence balanced summary covering the guest experience>",
  "highlights": ["<top positive point>", "<second positive point>", "<third positive point>"],
  "concerns": ["<main concern>", "<second concern>"],
  "bestFor": ["<type of traveler this suits, e.g. 'Families'>", "<another>"],
  "notIdealFor": ["<type of traveler this may not suit>"]
}

Rules:
- highlights must have 2–4 items
- concerns must have 0–3 items (empty array if no real concerns)
- bestFor and notIdealFor must each have 1–3 items
- Be specific and honest — avoid generic filler phrases
- Base everything strictly on the reviews provided`;

  const userPrompt = `Hotel: ${listingTitle}
Overall Rating: ${stats.overallRating}/5 from ${stats.totalReviews} reviews

Guest Reviews:
${comments.join("\n")}

Generate the JSON summary now.`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: 700,
  });

  const raw = response.choices[0]?.message?.content?.trim() || "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ─────────────────────────────────────────────────────────────
// In-memory cache: avoid re-calling Groq on every page load
// Cache key: listingId, invalidated when review count changes
// ─────────────────────────────────────────────────────────────
const summaryCache = new Map();
// { listingId: { reviewCount, generatedAt, data } }

function getCached(listingId, currentReviewCount) {
  const cached = summaryCache.get(listingId);
  if (!cached) return null;
  // Invalidate if new reviews came in or cache is older than 1 hour
  const ageMs = Date.now() - cached.generatedAt;
  if (cached.reviewCount !== currentReviewCount || ageMs > 60 * 60 * 1000) {
    summaryCache.delete(listingId);
    return null;
  }
  return cached.data;
}

function setCache(listingId, reviewCount, data) {
  summaryCache.set(listingId, { reviewCount, generatedAt: Date.now(), data });
}

// ─────────────────────────────────────────────────────────────
// ROUTE: GET /api/reviews/summary/:listingId
// Full AI-powered review summary for a listing detail page
// ─────────────────────────────────────────────────────────────
module.exports.getReviewSummary = async (req, res) => {
  try {
    const { listingId } = req.params;

    // Validate listing exists
    const listing = await Listing.findById(listingId).lean();
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Fetch all reviews for this listing
    const reviews = await Review.find({ listingId })
      .sort({ createdAt: -1 })
      .lean();

    // No reviews yet
    if (reviews.length === 0) {
      return res.status(200).json({
        listingId,
        listingTitle: listing.title,
        hasReviews: false,
        stats: null,
        aiSummary: null,
        recentReviews: [],
      });
    }

    // Compute stats
    const stats = computeRatingStats(reviews);

    // Check cache
    let aiSummary = getCached(listingId, reviews.length);

    // Generate fresh summary if not cached
    if (!aiSummary) {
      // Need at least 2 reviews with comments for a meaningful summary
      const commentCount = reviews.filter(
        (r) => r.comment && r.comment.trim().length > 5
      ).length;

      if (commentCount >= 2) {
        aiSummary = await generateSummaryWithGroq(listing.title, reviews, stats);
        if (aiSummary) {
          setCache(listingId, reviews.length, aiSummary);
        }
      }
    }

    // Return 5 most recent reviews for display alongside summary
    const recentReviews = reviews.slice(0, 5).map((r) => ({
      rating: r.rating,
      ratings: r.ratings,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({
      listingId,
      listingTitle: listing.title,
      hasReviews: true,
      stats,
      aiSummary,           // null if too few comments
      recentReviews,
    });
  } catch (error) {
    console.error("getReviewSummary error:", error);
    return res.status(500).json({ error: "Failed to generate review summary" });
  }
};

// ─────────────────────────────────────────────────────────────
// ROUTE: GET /api/reviews/summary/:listingId/quick
// Lightweight — returns only the AI headline + overall stats
// Good for listing cards, hover previews, etc.
// ─────────────────────────────────────────────────────────────
module.exports.getQuickSummary = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId, "title").lean();
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const reviews = await Review.find({ listingId }).lean();
    if (reviews.length === 0) {
      return res.status(200).json({
        listingId,
        hasReviews: false,
        overallRating: null,
        totalReviews: 0,
        headline: null,
        overallSentiment: null,
      });
    }

    const stats = computeRatingStats(reviews);
    let headline = null;
    let overallSentiment = null;

    // Use cache if available
    const cached = getCached(listingId, reviews.length);
    if (cached) {
      headline = cached.headline;
      overallSentiment = cached.overallSentiment;
    } else {
      // Generate and cache full summary in background, return just stats now
      const commentCount = reviews.filter(
        (r) => r.comment && r.comment.trim().length > 5
      ).length;

      if (commentCount >= 2) {
        // Fire-and-forget: generate in background, don't block response
        generateSummaryWithGroq(listing.title, reviews, stats)
          .then((summary) => {
            if (summary) setCache(listingId, reviews.length, summary);
          })
          .catch((err) => console.error("Background summary generation failed:", err));
      }
    }

    return res.status(200).json({
      listingId,
      hasReviews: true,
      overallRating: stats.overallRating,
      totalReviews: stats.totalReviews,
      headline,
      overallSentiment,
    });
  } catch (error) {
    console.error("getQuickSummary error:", error);
    return res.status(500).json({ error: "Failed to load quick summary" });
  }
};

// ─────────────────────────────────────────────────────────────
// ROUTE: POST /api/reviews/summary/batch
// Body: { listingIds: ["id1", "id2", ...] }  (max 20)
// Returns quick summaries for multiple listings at once
// Useful for search results / listing grid pages
// ─────────────────────────────────────────────────────────────
module.exports.getBatchSummaries = async (req, res) => {
  try {
    const { listingIds } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ error: "listingIds array is required" });
    }
    if (listingIds.length > 20) {
      return res.status(400).json({ error: "Maximum 20 listings per batch request" });
    }

    // Fetch all reviews for all requested listings in parallel
    const reviewsPerListing = await Promise.all(
      listingIds.map((id) => Review.find({ listingId: id }).lean())
    );

    const results = listingIds.map((listingId, i) => {
      const reviews = reviewsPerListing[i];
      if (reviews.length === 0) {
        return {
          listingId,
          hasReviews: false,
          overallRating: null,
          totalReviews: 0,
          overallSentiment: null,
          headline: null,
        };
      }

      const stats = computeRatingStats(reviews);
      const cached = getCached(listingId, reviews.length);

      return {
        listingId,
        hasReviews: true,
        overallRating: stats.overallRating,
        totalReviews: stats.totalReviews,
        distribution: stats.distribution,
        subRatings: stats.subRatings,
        overallSentiment: cached?.overallSentiment || null,
        headline: cached?.headline || null,
      };
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error("getBatchSummaries error:", error);
    return res.status(500).json({ error: "Failed to load batch summaries" });
  }
};