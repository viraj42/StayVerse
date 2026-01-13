const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { isListingAvailable } = require('../utils/checkAvailability');
const calculateBookingPrice = require('../utils/calculateBookingPrice');

// create booking-guest
module.exports.createBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "guest") {
      return res.status(403).json({ error: "Only guests can book listings" });
    }
    const { listingId, startDate, endDate, rooms, addons } = req.body;
    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing booking details" });
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: "Invalid date range" });
    }
    // find listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    // Prevent host booking own listing
    if (String(listing.hostId) === req.user.userId) {
      return res.status(400).json({ error: "You cannot book your own listing" });
    }
    const isAvailable = await isListingAvailable(listingId, startDate, endDate);
    if (!isAvailable) {
      return res.status(400).json({ error: "Selected dates are not available" });
    }
    const priceDetails = calculateBookingPrice({
      listing,
      startDate,
      endDate,
      rooms: rooms || 1,
      addons: addons || {}
    });

    const newBooking = await Booking.create({
      listingId,
      guestId: req.user.userId,
      hostId: listing.hostId,
      startDate,
      endDate,
      rooms: rooms || 1,
      addons: addons || {},
      totalAmount: priceDetails.totalPrice,
      status: "PENDING"
    });
    return res.status(201).json({
      booking: newBooking,
      priceBreakdown: priceDetails
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create booking" });
  }
};

//get listing of host
module.exports.getHostBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "host") {
      return res.status(403).json({ error: "Only host can view bookings" });
    }
    const bookings = await Booking.find({ hostId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "listingId",
        select: "title location images pricePerNight addonPrices",
        options: { lean: true }
      });
    const formatted = bookings.map(b => ({
      ...b.toObject(),
      listingImage: b.listingId?.images?.[0] || null,
      listingTitle: b.listingId?.title || "Listing unavailable",
      listingLocation: b.listingId?.location || null
    }));
    return res.json(formatted);
  } catch (error) {
    console.error("GET HOST BOOKINGS ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch host bookings" });
  }
};



// Perform boking-host
module.exports.performBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "host") {
      return res.status(403).json({ error: "Only host can perform this action" });
    }
    const { bookingId } = req.params;
    const { status } = req.body;
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (String(booking.hostId) !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (booking.status !== "PENDING") {
      return res.status(400).json({ error: "Booking already processed" });
    }
    // Re-check availability on approval
    if (status === "APPROVED") {
      const available = await isListingAvailable(
        booking.listingId,
        booking.startDate,
        booking.endDate
      );
      if (!available) {
        return res.status(400).json({ error: "Booking dates no longer available" });
      }
      await Listing.findByIdAndUpdate(
        booking.listingId,
        { $inc: { bookingCount: 1 } }
      );
    }
    booking.status = status;
    await booking.save();
    return res.json(booking);
  } catch (error) {
    console.error("PERFORM BOOKING ERROR:", error);
    return res.status(500).json({ error: "Failed to perform booking" });
  }
};

//cancel booking req-guest
module.exports.cancelBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "guest") {
      return res.status(403).json({ error: "Only guest can cancel booking" });
    }
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (String(booking.guestId) !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!["PENDING", "APPROVED"].includes(booking.status)) {
      return res.status(400).json({ error: "Booking cannot be cancelled" });
    }
    await Booking.findByIdAndDelete(bookingId);
    return res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);
    return res.status(500).json({ error: "Failed to cancel booking" });
  }
};



//guest listings
module.exports.getGuestBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const bookings = await Booking.find({ guestId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "listingId",
        select: "title location images pricePerNight addonPrices",
        options: { lean: true }
      });

    // If no bookings at all, return empty list
    if (!bookings.length) {
      return res.json([]);
    }
    // Remove bookings whose listing was deleted
    const validBookings = bookings.filter(b => b.listingId);
    // Format response
    const formatted = validBookings.map(b => ({
      ...b.toObject(),
      listingImage: b.listingId.images?.[0] || null,
      listingTitle: b.listingId.title,
      listingLocation: b.listingId.location
    }));
    return res.json(formatted);

  } catch (error) {
    console.error("GET GUEST BOOKINGS ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch guest bookings" });
  }
};

