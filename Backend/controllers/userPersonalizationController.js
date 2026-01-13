const Listing = require("../models/Listing");
const UserActivity = require("../models/UserActivity");
const SearchHistory = require("../models/SearchHistory");
const Booking = require("../models/Booking");
const formatListingCard = require("../utils/cardHelper");

// Get personalized home feed
module.exports.getPersonalizedFeed = async (req, res) => {
  try {
    let finalFeed = [];
    const addedListingIds = new Set();
    // 
    if (!req.user || !req.user.userId) {
      const popularListings = await getPopularListings(10);
      const cards = popularListings.map(formatListingCard);
      return res.status(200).json(cards);
    }
    const userId = req.user.userId;
    const recentViews = await UserActivity.find({
      userId,
      actionType: "view",
    })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate(
        "listingId",
        "title images pricePerNight location avgRating isHotDeal discountPercentage dealExpiry"
      );
    for (const activity of recentViews) {
      const listing = activity.listingId;
      if (listing && !addedListingIds.has(listing._id.toString())) {
        finalFeed.push(listing);
        addedListingIds.add(listing._id.toString());
      }
    }
    const searchHistory = await SearchHistory.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10);

    const locationFrequency ={};
    searchHistory.forEach((entry) => {
      if (entry.filters && entry.filters.location) {
        const loc = entry.filters.location;
        locationFrequency[loc] = (locationFrequency[loc] || 0) + 1;
      }
    });
    const preferredLocations = Object.keys(locationFrequency)
      .sort((a, b) => locationFrequency[b] - locationFrequency[a])
      .slice(0, 2);

    if (preferredLocations.length > 0) {
      const locationListings = await Listing.find({
        "location.address": { $in: preferredLocations },
      })
        .limit(10)
        .lean();

      for (const listing of locationListings) {
        if (!addedListingIds.has(listing._id.toString())) {
          finalFeed.push(listing);
          addedListingIds.add(listing._id.toString());
        }
      }
    }if (finalFeed.length < 10) {
      const popularListings = await getPopularListings(10);
      for (const listing of popularListings) {
        if (!addedListingIds.has(listing._id.toString())) {
          finalFeed.push(listing);
          addedListingIds.add(listing._id.toString());
        }
      }
    }
    finalFeed = finalFeed.slice(0, 10);
    const cards = finalFeed.map(formatListingCard);
    return res.status(200).json(cards);

  } catch (error) {
    return res.status(500).json({ error: "Failed to load personalized feed" });
  }
};


async function getPopularListings(limit) {
  const bookings = await Booking.aggregate([
    {
      $group: {
        _id: "$listingId",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  const listingIds = bookings.map((b) => b._id);

  return Listing.find({ _id: { $in: listingIds } }).lean();
}


// Personalized Trending Feed-
module.exports.getPersonalizedTrending = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recentActivity = await UserActivity.find({
      userId,
      actionType: "view",
    })
      .sort({ timestamp: -1 })
      .limit(10);

    const viewedListingIds = recentActivity.map(
      (activity) => activity.listingId.toString()
    );
    let trendingListings = await Listing.find({
      $or: [
        { bookingCount: { $gt: 0 } },
        { viewsCount: { $gt: 0 } },
      ],
    })
      .sort({ bookingCount: -1, viewsCount: -1 })
      .limit(20)
      .lean();
    if (viewedListingIds.length > 0) {
      trendingListings.sort((a, b) => {
        const aViewed = viewedListingIds.includes(a._id.toString());
        const bViewed = viewedListingIds.includes(b._id.toString());
        if (aViewed && !bViewed) return -1;
        if (!aViewed && bViewed) return 1;
        return 0;
      });
    }
    const finalTrending = trendingListings.slice(0, 10);
    const cards = finalTrending.map(formatListingCard);
    return res.status(200).json(cards);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to load personalized trending feed" });
  }
};
