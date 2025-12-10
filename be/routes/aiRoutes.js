const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { createWorkoutPlan, createNutritionPlan, getMyPlans } = require('../controllers/aiController');

router.use(verifyToken);

router.post('/workout', createWorkoutPlan);
router.post('/nutrition', createNutritionPlan);
router.get('/my-plans', getMyPlans);

module.exports = router;
