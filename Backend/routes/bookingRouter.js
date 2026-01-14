const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/userRole');

const bookingController = require('../controllers/bookingController');

// Create booking (guest)
router.post('/', requireAuth, requireRole("guest"), bookingController.createBooking);

// Guest bookings
router.get('/guest', requireAuth, requireRole("guest"), bookingController.getGuestBookings);

// Host bookings
router.get('/host', requireAuth, requireRole("host"), bookingController.getHostBookings);

// Host perform booking
router.patch("/:bookingId", requireAuth, requireRole("host"), bookingController.performBooking);

// Guest cancel booking
router.delete("/cancel/:bookingId", requireAuth, requireRole("guest"), bookingController.cancelBooking);

router.get("/details/:bookingId", bookingController.getBookingDetails);

router.post("/check-availability", bookingController.checkBookingAvailability);
router.get("/blocked-dates/:listingId", bookingController.getBlockedDates);
router.post("/available-rooms", bookingController.getAvailableRooms);


module.exports = router;
