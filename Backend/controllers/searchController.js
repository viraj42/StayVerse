const Listing = require("../models/Listing");
const formatListingCard = require("../utils/cardHelper");
module.exports.locationAutocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: "Query must be at least 2 characters",
      });
    }
    const results = await Listing.aggregate([
  {
    $match: {
      $or: [
        { "location.address": { $regex: q, $options: "i" } },
        { "location.city":    { $regex: q, $options: "i" } },
        { "location.state":   { $regex: q, $options: "i" } }
      ]
    }
  },

  // Determine priority
  {
    $addFields: {
      priority: {
        $switch: {
          branches: [
            {
              case: { $regexMatch: { input: "$location.address", regex: q, options: "i" } },
              then: 1 
            },
            {
              case: { $regexMatch: { input: "$location.city", regex: q, options: "i" } },
              then: 2
            },
            {
              case: { $regexMatch: { input: "$location.state", regex: q, options: "i" } },
              then: 3
            }
          ],
          default: 4
        }
      }
    }
  },

  // Group always by address
  {
    $group: {
      _id: "$location.address",
      address: { $first: "$location.address" },
      city: { $first: "$location.city" },
      state: { $first: "$location.state" },
      country: { $first: "$location.country" },
      listingsCount: { $sum: 1 },
      priority: { $first: "$priority" }
    }
  },

  // Sort by priority first, then by listing count
  { $sort: { priority: 1, listingsCount: -1 } },

  // Fixed result size
  { $limit: 7 }
]);

    console.log(results);
    return res.status(200).json(results);

  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch location autocomplete results",
    });
  }
};




//Popular destinations
module.exports.destinationSuggestions = async (req, res) => {
  try {
    const results = await Listing.aggregate([
      {
        $match: {
          $or: [
            { bookingCount: { $gt: 0 } },
            { viewsCount: { $gt: 0 } },
          ],
        },
      },
      {
        $group: {
          _id: "$location.city",
          city: { $first: "$location.city" },
          state: { $first: "$location.state" },
          country: { $first: "$location.country" },
          totalBookings: { $sum: "$bookingCount" },
          totalViews: { $sum: "$viewsCount" },
        },
      },
      {
        $addFields: {
          popularityScore: {
            $add: [
              { $multiply: ["$totalBookings", 2] },
              "$totalViews",
            ],
          },
        },
      },
      {
        $sort: { popularityScore: -1 },
      },
      {
        $limit: 7,
      },
    ]);

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch destination suggestions",
    });
  }
};


//return result of searchbar
module.exports.searchListings = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: "Invalid search query" });
    }

    const parts = q.split(",").map(p => p.trim());

    const addressPart = parts[0] || null;
    const cityPart    = parts[1] || null;
    const statePart   = parts[2] || null;

    let listings = [];

    // 1. Address match
    if (addressPart) {
      listings = await Listing.find({
        "location.address": { $regex: new RegExp(`^${addressPart}$`, "i") }
      });

      if (listings.length > 0) {
        const cards = listings.map(formatListingCard);
        return res.status(200).json({ level: "address", listings: cards });
      }
    }

    // 2. City match
    if (cityPart || addressPart) {
      const cityQuery = cityPart || addressPart;

      listings = await Listing.find({
        "location.city": { $regex: new RegExp(`^${cityQuery}$`, "i") }
      });

      if (listings.length > 0) {
        const cards = listings.map(formatListingCard);
        return res.status(200).json({ level: "city", listings: cards });
      }
    }

    // 3. State match
    if (statePart || cityPart || addressPart) {
      const stateQuery = statePart || cityPart || addressPart;

      listings = await Listing.find({
        "location.state": { $regex: new RegExp(`^${stateQuery}$`, "i") }
      });

      if (listings.length > 0) {
        const cards = listings.map(formatListingCard);
        return res.status(200).json({ level: "state", listings: cards });
      }
    }

    // 4. Partial fallback
    const fallbackRegex = new RegExp(addressPart || q, "i");

    listings = await Listing.find({
      $or: [
        { "location.address": { $regex: fallbackRegex } },
        { "location.city": { $regex: fallbackRegex } },
        { "location.state": { $regex: fallbackRegex } }
      ]
    });

    const cards = listings.map(formatListingCard);
    return res.status(200).json({ level: "partial", listings: cards });

  } catch (error) {
    console.error("Search listings error:", error);
    return res.status(500).json({ error: "Search failed" });
  }
};