module.exports = function calculateBookingPrice({ listing, startDate, endDate, rooms = 1, addons }) {
  const nights = Math.ceil(
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );

  // 1. Base subtotal BEFORE discount
  const baseSubtotal = listing.pricePerNight * nights * rooms;

  // 2. Add-ons total
  let addonsTotal = 0;
  if (addons?.breakfast) addonsTotal += listing.addonPrices.breakfast * nights * rooms;
  if (addons?.lunch) addonsTotal += listing.addonPrices.lunch * nights * rooms;
  if (addons?.dinner) addonsTotal += listing.addonPrices.dinner * nights * rooms;

  // 3. Discount
  const discountPercentage = listing.discountPercentage || 0;
  const discountAmount = (baseSubtotal * discountPercentage) / 100;

  // 4. Subtotal AFTER discount
  const discountedSubtotal = baseSubtotal - discountAmount;

  // 5. Tax calculated AFTER discount
  const taxAmount = (discountedSubtotal + addonsTotal) * 0.12;

  // 6. Fixed service fee
  const serviceFee = 500;

  // 7. Final total
  const totalPrice = discountedSubtotal + addonsTotal + taxAmount + serviceFee;

  // 8. Effective per-night price after discount (for UI display)
  const effectivePricePerNight =
    discountPercentage > 0
      ? Math.round(
          listing.pricePerNight -
          (listing.pricePerNight * discountPercentage) / 100
        )
      : listing.pricePerNight;

  return {
    nights,
    rooms,
    subtotal: baseSubtotal,          
    discountedSubtotal,              
    addonsTotal,
    taxAmount,
    serviceFee,
    discountAmount,
    effectivePricePerNight,          
    totalPrice: Math.round(totalPrice)
  };
};
