const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const Review=require('../models/Review');

//create a review only if you have boooked that listing-guest
module.exports.createReview = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "guest") {
      return res.status(403).json({ error: "Only guests can book listings" });
    }
    const { listingId, rating, comment, ratings } = req.body;
    if (!listingId || rating === undefined) {
      return res.status(400).json({ error: "Missing review details" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid Rating range" });
    }

    // Validate category ratings if provided
    if (ratings) {
      for (const key of ["cleanliness","comfort","location","facilities","valueForMoney"]) {
        if (ratings[key] && (ratings[key] < 1 || ratings[key] > 5)) {
          return res.status(400).json({ error: `Invalid ${key} rating` });
        }
      }
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "No Listing found" });

    const completedBooking = await Booking.findOne({
      listingId,
      guestId: req.user.userId,
      status: "APPROVED",
    });
    if (!completedBooking) {
      return res.status(403).json({
        error: "You can review only after completing a booking",
      });
    }
    const existingReview = await Review.findOne({
      listingId,
      userId: req.user.userId,
    });
    if (existingReview) {
      return res.status(400).json({
        error: "You have already reviewed this listing",
      });
    }
    const newReview = await Review.create({
      listingId,
      userId: req.user.userId,
      rating,
      ratings, 
      comment
    });

    // Recalculate average listing rating
    const allReviews = await Review.find({ listingId });
    let sum = 0;
    allReviews.forEach((rev) => sum += rev.rating);
    const avgRate = sum / allReviews.length;

    listing.avgRating = avgRate;
    await listing.save();
    return res.status(201).json(newReview);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create review" });
  }
};

//listing review for a list
module.exports.getListingReviews =async (req, res) => {
  try {
    const { listingId }=req.params;
    if (!listingId){
      return res.status(400).json({ error: "Listing ID is required" });
    }
    const listing=await Listing.findById(listingId);
    if (!listing){
      return res.status(404).json({ error: "Listing not found" });
    }
    const reviews =await Review.find({ listingId })
      .sort({ createdAt: -1 })
      .populate("userId", "name");
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({error: "Failed to fetch reviews" });
  }
};
