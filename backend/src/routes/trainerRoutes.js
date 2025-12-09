const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { updateTrainerProfile, getTrainers, setAvailability, getTrainerSchedule } = require('../controllers/trainerController');

router.use(verifyToken);

// Update/Create Trainer Profile (Any authenticated user can technically try, but UI should restrict to PT role)
router.post('/profile', updateTrainerProfile);

// Get all trainers
router.get('/all', getTrainers);

// Set Availability (Should be restricted to PT/Admin)
router.post('/availability', setAvailability);

// Get specific trainer schedule
router.get('/schedule/:trainerId', getTrainerSchedule);

module.exports = router;
