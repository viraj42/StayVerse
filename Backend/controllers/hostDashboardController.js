const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

//host dashboard
module.exports.getHostDashboard = async (req, res) => {
  try {
    const hostId = req.user.userId;
    const hostObjectId = new mongoose.Types.ObjectId(hostId);

    const today = new Date();
    today.setHours(0,0,0,0);
    const totalListings = await Listing.countDocuments({ hostId });

    const pendingBookingsCount = await Booking.countDocuments({
      hostId,
      status: "PENDING"
    });
    const upcomingBookingsRaw = await Booking.find({
      hostId,
      status: "APPROVED",
      endDate: { $gte: today }
    })
      .populate("listingId", "title")
      .sort({ startDate: 1 })
      .limit(5);
    const upcomingBookings = upcomingBookingsRaw.filter(b => b.listingId);

    const earningsAgg = await Booking.aggregate([
      {
        $match: {
          hostId: hostObjectId,
          status: { $in: ["APPROVED", "COMPLETED"] }
        }
      }, {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalEarnings = earningsAgg.length > 0 ? earningsAgg[0].total : 0;
    //Pending Requests
    const recentRequestsRaw = await Booking.find({
      hostId,
      status: "PENDING"
    })
      .populate("listingId", "title")
      .populate("guestId", "name")
      .sort({ createdAt: -1 })
      .limit(5);
    const recentRequests = recentRequestsRaw.filter(b => b.listingId);
    const topListings = await Listing.find({ hostId })
      .sort({ bookingCount: -1 })
      .select("title bookingCount viewsCount")
      .limit(5);
    res.status(200).json({
      totalListings,
      pendingBookingsCount,
      totalEarnings,
      upcomingBookings,
      recentRequests,
      topListings
    });
  } catch (error) {
    console.error("Host Dashboard Error:", error);
    res.status(500).json({ message: "Failed to load host dashboard" });
  }
};
