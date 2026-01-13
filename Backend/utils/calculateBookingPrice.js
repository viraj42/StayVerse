module.exports = function calculateBookingPrice({ listing, startDate, endDate, rooms = 1, addons }) {
  const nights = Math.ceil(
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );

  const subtotal = listing.pricePerNight * nights * rooms;

  let addonsTotal = 0;
  if (addons?.breakfast) addonsTotal += listing.addonPrices.breakfast * nights * rooms;
  if (addons?.lunch) addonsTotal += listing.addonPrices.lunch * nights * rooms;
  if (addons?.dinner) addonsTotal += listing.addonPrices.dinner * nights * rooms;

  const taxAmount = (subtotal + addonsTotal) * 0.12;
  const serviceFee = 500;

  const discountAmount = (subtotal * (listing.discountPercentage || 0)) / 100;

  const totalPrice = subtotal + addonsTotal + taxAmount + serviceFee - discountAmount;

  return {
    nights,
    rooms,
    subtotal,
    addonsTotal,
    taxAmount,
    serviceFee,
    discountAmount,
    totalPrice: Math.round(totalPrice)
  };
};
