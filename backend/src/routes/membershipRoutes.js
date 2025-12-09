const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getMyMembership, purchasePackage, getPackages } = require('../controllers/membershipController');

router.use(verifyToken);

router.get('/my-membership', getMyMembership);
router.get('/packages', getPackages);
router.post('/purchase', purchasePackage);

module.exports = router;
