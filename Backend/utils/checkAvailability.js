const Booking=require('../models/Booking')

module.exports.isListingAvailable=async(listingId,startDate,endDate)=>{
    //First → APPROVED and Second:On approval attempt → conflict
    const conflictBook=await Booking.findOne({
        listingId,
        status:"APPROVED",
        startDate: { $lt: endDate },
        endDate: { $gt: startDate },
    })

    return !conflictBook;
};