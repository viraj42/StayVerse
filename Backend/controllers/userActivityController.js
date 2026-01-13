const UserActivity = require("../models/UserActivity");
const Listing = require("../models/Listing");

//track activity of guest by wishlist+view
module.exports.trackActivity = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "guest") {
      return res.status(403).json({ error: "Only guests generate activity" });
    }

    const { listingId, actionType } = req.body;
    if (!listingId || !actionType) {
      return res.status(400).json({ error: "Missing activity details" });
    }

    if (!["view", "wishlist"].includes(actionType)) {
      return res.status(400).json({ error: "Invalid activity type" });
    }
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    const activity = await UserActivity.create({
      userId: req.user.userId,
      listingId,
      actionType,
    });
    return res.status(201).json(activity);
  } catch (error) {
    return res.status(500).json({ error: "Failed to track activity" });
  }
};

//recent activity
module.exports.getRecentActivities = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== "guest") {
      return res.status(403).json({ error: "Only guests can view activity" });
    }
    const activities = await UserActivity.find({
      userId: req.user.userId,
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate(
        "listingId",
        "title images pricePerNight location avgRating category"
      );
    return res.status(200).json(activities);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch activity" });
  }
};

//delete activity
module.exports.deleteActivity = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "guest") {
      return res.status(403).json({ error: "Only guests can modify activity" });
    }
    await UserActivity.deleteMany({ userId: req.user.userId });
    return res.status(200).json({ message: "Activity history cleared successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete activity history" });
  }
};
