const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

module.exports = {
  // GET CURRENT USER PROFILE
  getMyProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId)
        .select("name email role createdAt profileImage");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json(user);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  },

  // UPLOAD profile img
uploadProfileImage: async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    const imageUrl = req.file.path;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    ).select("name email role profileImage");
    return res.json(updatedUser);
  } catch (err) {
    console.error("Profile Image Upload Error:", err);
    return res.status(500).json({ error: "Image upload failed" });
  }
},


 //update profile fields
  updateMyProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { name } = req.body;
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: "Valid name is required" });
      }
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name: name.trim() },
        { new: true, runValidators: true }
      ).select("name email role");
      return res.json(updatedUser);

    } catch (err) {
      console.error("Profile Update Error:", err);
      return res.status(500).json({ error: "Update failed" });
    }
  },


//host dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const { userId, role } = req.user;
      if (role === "host") {
        const listingsCount = await Listing.countDocuments({ hostId: userId });
        const approvedBookings = await Booking.find({
          hostId: userId,
          status: "APPROVED"
        });
        const upcomingBookings = await Booking.countDocuments({
          hostId: userId,
          status: "APPROVED",
          startDate: { $gte: new Date() }
        });
        const earnings = approvedBookings.reduce(
          (sum, booking) => sum + booking.totalAmount, 0
        );
        return res.json({
          role: "host",
          listingsCount,
          upcomingBookings,
          earnings
        });
      }

      //for guest
      if (role === "guest") {
        const completedTrips = await Booking.find({
          guestId: userId,
          status: "COMPLETED"
        }).populate("listingId", "location.city");

        const citiesVisited = new Set(
          completedTrips.map(b => b.listingId?.location?.city)
        ).size;
        const upcomingTrips = await Booking.countDocuments({
          guestId: userId,
          status: "APPROVED",
          startDate: { $gte: new Date() }
        });
        return res.json({
          role: "guest",
          citiesVisited,
          upcomingTrips,
          totalTrips: completedTrips.length
        });
      }
      return res.status(400).json({ error: "Invalid role" });

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      return res.status(500).json({ error: "Dashboard fetch failed" });
    }
  }

};
