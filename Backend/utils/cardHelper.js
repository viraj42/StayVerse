module.exports = function formatListingCard(l) {
  // Ensure location object always exists
  const locationObj = l.location || {};
  // Validate discount applicability
  const hasDiscount =
    l.isHotDeal === true &&
    typeof l.discountPercentage === "number" &&
    l.discountPercentage > 0 &&
    (!l.dealExpiry || new Date(l.dealExpiry).getTime() > Date.now());

  // Compute final price safely
  const basePrice = typeof l.pricePerNight === "number" ? l.pricePerNight : 0;

  const finalPrice = hasDiscount
    ? Math.round(basePrice * (1 - l.discountPercentage / 100))
    : basePrice;

  // Build readable location string
  const location =
    locationObj.city
      ? `${locationObj.city}${locationObj.state ? ", " + locationObj.state : ""}`
      : locationObj.address || "Unknown location";

  // Rating label logic
  const ratingValue = typeof l.avgRating === "number" ? l.avgRating : 0;

  const ratingLabel =
    ratingValue >= 4.5 ? "Excellent" :
    ratingValue >= 4.0 ? "Very Good" :
    ratingValue >= 3.5 ? "Good" :
    ratingValue > 0   ? "Average" :
    null;

  return {
    _id: l._id,
    title: l.title || "Untitled Listing",

    // Image handling
    // Image handling
image: Array.isArray(l.images) && l.images.length > 0
  ? l.images[0]
  :"https://img.freepik.com/free-vector/flat-hotel-facade-background_23-2148157379.jpg?semt=ais_hybrid&w=740&q=80",

    // Location
    location,

    // Ratings
    rating: ratingValue,
    ratingLabel,
    reviewCount: typeof l.reviewCount === "number" ? l.reviewCount : 0,

    // Pricing
    originalPrice: hasDiscount ? `₹${basePrice}` : null,
    finalPrice: `₹${finalPrice}`,

    // Badge
    badgeText: hasDiscount ? `-${l.discountPercentage}%` : null,
  };
};
