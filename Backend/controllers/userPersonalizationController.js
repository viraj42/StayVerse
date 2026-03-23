const Listing = require("../models/Listing");
const UserActivity = require("../models/UserActivity");
const SearchHistory = require("../models/SearchHistory");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const formatListingCard = require("../utils/cardHelper");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────
// HELPER: Build a rich user profile from DB
// ─────────────────────────────────────────────
async function buildUserProfile(userId) {
  // Past bookings
  const bookings = await Booking.find({ guestId: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("listingId", "title location pricePerNight facilities propertyType category")
    .lean();

  // Recently viewed listings
  const recentViews = await UserActivity.find({ userId, actionType: "view" })
    .sort({ timestamp: -1 })
    .limit(10)
    .populate("listingId", "title location pricePerNight facilities propertyType category")
    .lean();

  // Reviews left by user (reveals preferences)
  const userReviews = await Review.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("listingId", "title location propertyType")
    .lean();

  // Search history
  const searchHistory = await SearchHistory.find({ userId })
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();

  // Derive preferred locations from search history
  const locationFrequency = {};
  searchHistory.forEach((entry) => {
    const loc = entry.filters?.location || entry.filters?.city;
    if (loc) locationFrequency[loc] = (locationFrequency[loc] || 0) + 1;
  });
  const preferredLocations = Object.keys(locationFrequency)
    .sort((a, b) => locationFrequency[b] - locationFrequency[a])
    .slice(0, 3);

  // Price range from past bookings
  const prices = bookings
    .map((b) => b.listingId?.pricePerNight)
    .filter(Boolean);
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;

  // Facility preferences from bookings + views
  const facilityCount = {};
  [...bookings.map((b) => b.listingId), ...recentViews.map((v) => v.listingId)]
    .filter(Boolean)
    .forEach((l) => {
      (l.facilities || []).forEach((f) => {
        facilityCount[f] = (facilityCount[f] || 0) + 1;
      });
    });
  const preferredFacilities = Object.keys(facilityCount)
    .sort((a, b) => facilityCount[b] - facilityCount[a])
    .slice(0, 5);

  // Property types from bookings
  const propertyTypes = [
    ...new Set(
      bookings.map((b) => b.listingId?.propertyType).filter(Boolean)
    ),
  ];

  // High-rated stays by user
  const highRatedListings = userReviews
    .filter((r) => r.rating >= 4)
    .map((r) => r.listingId?.title)
    .filter(Boolean);

  return {
    preferredLocations,
    avgPricePerNight: avgPrice,
    preferredFacilities,
    preferredPropertyTypes: propertyTypes,
    highRatedStays: highRatedListings,
    recentlyViewedTitles: recentViews
      .map((v) => v.listingId?.title)
      .filter(Boolean),
    recentlyBookedCities: bookings
      .map((b) => b.listingId?.location?.city)
      .filter(Boolean),
  };
}

// ─────────────────────────────────────────────
// HELPER: Ask Groq to rank candidate listings
// ─────────────────────────────────────────────
async function rankWithGroq(userProfile, candidateListings) {
  // Slim down candidates to avoid token overflow
  const slimCandidates = candidateListings.map((l) => ({
    id: l._id.toString(),
    title: l.title,
    city: l.location?.city,
    state: l.location?.state,
    pricePerNight: l.pricePerNight,
    propertyType: l.propertyType,
    facilities: l.facilities || [],
    avgRating: l.avgRating || null,
    bookingCount: l.bookingCount || 0,
    viewsCount: l.viewsCount || 0,
    isHotDeal: l.isHotDeal,
    category: l.category,
  }));

  const systemPrompt = `You are a hotel recommendation engine. 
Given a user profile and a list of hotel listings, rank the listings from most to least relevant for this specific user.
Return ONLY a valid JSON array of listing IDs in order of recommendation, like:
["id1", "id2", "id3", ...]
No explanation, no markdown, just the JSON array.`;

  const userPrompt = `User Profile:
${JSON.stringify(userProfile, null, 2)}

Available Listings:
${JSON.stringify(slimCandidates, null, 2)}

Rank these listings for this user. Return a JSON array of IDs ordered by best match first.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 512,
  });

  const raw = response.choices[0]?.message?.content?.trim() || "[]";

  // Safely parse — strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const rankedIds = JSON.parse(cleaned);

  // Re-order candidates by LLM ranking
  const idToListing = Object.fromEntries(
    candidateListings.map((l) => [l._id.toString(), l])
  );

  const ranked = rankedIds
    .map((id) => idToListing[id])
    .filter(Boolean);

  // Append any listings LLM missed (safety net)
  const rankedSet = new Set(rankedIds);
  candidateListings.forEach((l) => {
    if (!rankedSet.has(l._id.toString())) ranked.push(l);
  });

  return ranked;
}

// ─────────────────────────────────────────────
// HELPER: Get popular listings by booking count
// ─────────────────────────────────────────────
async function getPopularListings(limit) {
  const bookings = await Booking.aggregate([
    { $group: { _id: "$listingId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  const listingIds = bookings.map((b) => b._id);
  return Listing.find({ _id: { $in: listingIds } }).lean();
}

// ─────────────────────────────────────────────
// ROUTE: GET /api/recommendations/feed
// Personalized home feed (with LLM ranking)
// ─────────────────────────────────────────────
module.exports.getPersonalizedFeed = async (req, res) => {
  try {
    // ── Unauthenticated: return popular listings ──
    if (!req.user || !req.user.userId) {
      const popular = await getPopularListings(10);
      return res.status(200).json(popular.map(formatListingCard));
    }

    const userId = req.user.userId;
    const addedIds = new Set();
    let candidates = [];

    // 1. Recently viewed listings
    const recentViews = await UserActivity.find({ userId, actionType: "view" })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate(
        "listingId",
        "title images pricePerNight location avgRating isHotDeal discountPercentage dealExpiry facilities propertyType category bookingCount viewsCount"
      );

    for (const activity of recentViews) {
      const l = activity.listingId;
      if (l && !addedIds.has(l._id.toString())) {
        candidates.push(l.toObject ? l.toObject() : l);
        addedIds.add(l._id.toString());
      }
    }

    // 2. Location-based candidates from search history
    const searchHistory = await SearchHistory.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10);

    const locationFrequency = {};
    searchHistory.forEach((entry) => {
      const loc = entry.filters?.location || entry.filters?.city;
      if (loc) locationFrequency[loc] = (locationFrequency[loc] || 0) + 1;
    });
    const preferredLocations = Object.keys(locationFrequency)
      .sort((a, b) => locationFrequency[b] - locationFrequency[a])
      .slice(0, 3);

    if (preferredLocations.length > 0) {
      const locListings = await Listing.find({
        $or: [
          { "location.city": { $in: preferredLocations } },
          { "location.address": { $in: preferredLocations } },
        ],
      })
        .limit(10)
        .lean();

      for (const l of locListings) {
        if (!addedIds.has(l._id.toString())) {
          candidates.push(l);
          addedIds.add(l._id.toString());
        }
      }
    }

    // 3. Property-type based on booking history
    const pastBookings = await Booking.find({ guestId: userId })
      .limit(5)
      .populate("listingId", "propertyType category")
      .lean();

    const bookedTypes = [
      ...new Set(
        pastBookings.map((b) => b.listingId?.propertyType).filter(Boolean)
      ),
    ];

    if (bookedTypes.length > 0) {
      const typeListings = await Listing.find({
        propertyType: { $in: bookedTypes },
        _id: { $nin: [...addedIds] },
      })
        .limit(10)
        .lean();

      for (const l of typeListings) {
        if (!addedIds.has(l._id.toString())) {
          candidates.push(l);
          addedIds.add(l._id.toString());
        }
      }
    }

    // 4. Pad with popular listings if still thin
    if (candidates.length < 15) {
      const popular = await getPopularListings(15);
      for (const l of popular) {
        if (!addedIds.has(l._id.toString())) {
          candidates.push(l);
          addedIds.add(l._id.toString());
        }
      }
    }

    // 5. Build user profile & let Groq rank the candidates
    let finalFeed;
    if (candidates.length > 0) {
      const userProfile = await buildUserProfile(userId);
      const ranked = await rankWithGroq(userProfile, candidates);
      finalFeed = ranked.slice(0, 10);
    } else {
      finalFeed = [];
    }

    return res.status(200).json(finalFeed.map(formatListingCard));
  } catch (error) {
    console.error("getPersonalizedFeed error:", error);
    return res.status(500).json({ error: "Failed to load personalized feed" });
  }
};

// ─────────────────────────────────────────────
// ROUTE: GET /api/recommendations/trending
// Personalized trending (with LLM re-ranking)
// ─────────────────────────────────────────────
module.exports.getPersonalizedTrending = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      // Unauthenticated: pure popularity sort
      const trending = await Listing.find({
        $or: [{ bookingCount: { $gt: 0 } }, { viewsCount: { $gt: 0 } }],
      })
        .sort({ bookingCount: -1, viewsCount: -1 })
        .limit(10)
        .lean();
      return res.status(200).json(trending.map(formatListingCard));
    }

    const userId = req.user.userId;

    // Fetch globally trending listings (top 20 by engagement)
    const trendingListings = await Listing.find({
      $or: [{ bookingCount: { $gt: 0 } }, { viewsCount: { $gt: 0 } }],
    })
      .sort({ bookingCount: -1, viewsCount: -1 })
      .limit(20)
      .lean();

    if (trendingListings.length === 0) {
      return res.status(200).json([]);
    }

    // Build user profile & re-rank with Groq
    const userProfile = await buildUserProfile(userId);
    const ranked = await rankWithGroq(userProfile, trendingListings);
    const finalTrending = ranked.slice(0, 10);

    return res.status(200).json(finalTrending.map(formatListingCard));
  } catch (error) {
    console.error("getPersonalizedTrending error:", error);
    return res
      .status(500)
      .json({ error: "Failed to load personalized trending feed" });
  }
};

// ─────────────────────────────────────────────
// ROUTE: GET /api/recommendations/similar/:listingId
// "Similar listings" for a detail page
// ─────────────────────────────────────────────
module.exports.getSimilarListings = async (req, res) => {
  try {
    const { listingId } = req.params;
    const sourceListing = await Listing.findById(listingId).lean();
    if (!sourceListing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Pull candidates from same city / property type
    const candidates = await Listing.find({
      _id: { $ne: sourceListing._id },
      $or: [
        { "location.city": sourceListing.location?.city },
        { propertyType: sourceListing.propertyType },
        { category: sourceListing.category },
      ],
    })
      .limit(20)
      .lean();

    if (candidates.length === 0) {
      return res.status(200).json([]);
    }

    // Use Groq to pick the 6 most similar
    const systemPrompt = `You are a hotel recommendation engine.
Given a reference hotel and a list of candidate hotels, return the IDs of the 6 most similar hotels.
Return ONLY a valid JSON array of IDs. No explanation, no markdown.`;

    const userPrompt = `Reference Hotel:
${JSON.stringify({
  title: sourceListing.title,
  city: sourceListing.location?.city,
  pricePerNight: sourceListing.pricePerNight,
  propertyType: sourceListing.propertyType,
  facilities: sourceListing.facilities,
  category: sourceListing.category,
}, null, 2)}

Candidates:
${JSON.stringify(
  candidates.map((l) => ({
    id: l._id.toString(),
    title: l.title,
    city: l.location?.city,
    pricePerNight: l.pricePerNight,
    propertyType: l.propertyType,
    facilities: l.facilities || [],
    category: l.category,
  })),
  null,
  2
)}

Return a JSON array of the 6 most similar listing IDs.`;

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 256,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const rankedIds = JSON.parse(cleaned);

    const idToListing = Object.fromEntries(
      candidates.map((l) => [l._id.toString(), l])
    );
    const similar = rankedIds.map((id) => idToListing[id]).filter(Boolean);

    return res.status(200).json(similar.map(formatListingCard));
  } catch (error) {
    console.error("getSimilarListings error:", error);
    return res.status(500).json({ error: "Failed to load similar listings" });
  }
};