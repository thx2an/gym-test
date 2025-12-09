const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getSessionQR, verifyCheckIn } = require('../controllers/sessionController');

router.use(verifyToken);

// Get QR Token for a specific session (Member)
router.get('/:sessionId/qr', getSessionQR);

// Verify QR Token (Trainer/Admin)
router.post('/checkin', verifyCheckIn);

module.exports = router;
