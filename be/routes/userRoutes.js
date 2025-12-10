const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/userController');

// Helper to check for user role if needed, but profile is for everyone
router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
