const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

module.exports.isListingAvailable = async (listingId, startDate, endDate, roomsRequested = 1) => {

  // Fetch listing capacity
  const listing = await Listing.findById(listingId).select("totalRooms");
  if (!listing) return false;
  const overlapping = await Booking.find({
    listingId,
    status: "APPROVED",
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) }
  });
  const roomsAlreadyBooked = overlapping.reduce(
    (sum, b) => sum + (b.rooms || 1),
    0
  );
  return (roomsAlreadyBooked + roomsRequested) <= listing.totalRooms;
};
