const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getAvailableSlots, createBooking, getMyBookings } = require('../controllers/bookingController');

router.use(verifyToken);

// Public (Member) routes
router.get('/slots', getAvailableSlots);
router.post('/book', createBooking);
router.get('/my-bookings', getMyBookings);

// Allow searching for available slots
// e.g. GET /api/booking/slots?trainerId=1&date=2023-10-27

module.exports = router;
