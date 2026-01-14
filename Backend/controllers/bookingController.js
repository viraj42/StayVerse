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
    const isAvailable = await isListingAvailable(
  listingId,
  startDate,
  endDate,
  rooms || 1
);

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
  const isAvailable = await isListingAvailable(
    booking.listingId,
    booking.startDate,
    booking.endDate,
    booking.rooms || 1
  );

  if (!isAvailable) {
    return res.status(400).json({ error: "Selected dates are not available" });
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



module.exports.checkBookingAvailability = async (req, res) => {
  try {
    const { listingId, startDate, endDate, rooms } = req.body;

    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ available: false });
    }

    const available = await isListingAvailable(
      listingId,
      startDate,
      endDate,
      rooms || 1
    );

    return res.json({ available });
  } catch (error) {
    console.error("CHECK AVAILABILITY ERROR:", error);
    return res.json({ available: false });
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
  select: "title location images pricePerNight discountPercentage addonPrices",
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


module.exports.getBlockedDates = async (req, res) => {
  try {
    const listingId = req.params.listingId;

    // 1. Get total room capacity
    const listing = await Listing.findById(listingId).select("totalRooms");
    if (!listing) return res.json([]);

    // 2. Get all approved bookings
    const bookings = await Booking.find({
      listingId,
      status: "APPROVED"
    });

    if (!bookings.length) return res.json([]);

    // 3. Build per-day booking count
    const dateRoomMap = {}; 
    // key = YYYY-MM-DD , value = rooms booked that day

    bookings.forEach(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      let current = new Date(start);

      while (current < end) {
        const key = current.toISOString().split("T")[0];
        dateRoomMap[key] = (dateRoomMap[key] || 0) + (b.rooms || 1);
        current.setDate(current.getDate() + 1);
      }
    });

    // 4. Extract only fully-booked days
    const blocked = [];

    Object.entries(dateRoomMap).forEach(([date, roomsBooked]) => {
      if (roomsBooked >= listing.totalRooms) {
        blocked.push({
          startDate: new Date(date),
          endDate: new Date(date)
        });
      }
    });

    return res.json(blocked);

  } catch {
    return res.json([]);
  }
};

// Return available room count for given range
module.exports.getAvailableRooms = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    const listing = await Listing.findById(listingId).select("totalRooms");

    const overlapping = await Booking.find({
      listingId,
      status: "APPROVED",
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) }
    });

    const roomsBooked = overlapping.reduce((s, b) => s + (b.rooms || 1), 0);
    const availableRooms = listing.totalRooms - roomsBooked;

    res.json({ availableRooms });
  } catch {
    res.json({ availableRooms: 0 });
  }
};


exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("listingId", 
        "title propertyType location images pricePerNight"
      )
      .populate("guestId", "name email")
      .populate("hostId", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    console.log(booking);
    
    res.status(200).json({ booking });

  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ message: "Server error" });
  }
};
