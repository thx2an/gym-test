const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { createPayment, confirmPayment, requestRefund, getRefunds, processRefund } = require('../controllers/paymentController');

router.use(verifyToken);

router.post('/create-link', createPayment);
router.post('/confirm', confirmPayment); // Mock confirmation endpoint

// Refund Routes
router.post('/refund/request', verifyToken, requestRefund);
router.get('/refund/all', verifyToken, isAdmin, getRefunds);
router.put('/refund/process', verifyToken, isAdmin, processRefund);

module.exports = router;
