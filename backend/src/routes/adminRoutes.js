const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { getAllBranches, createBranch, updateBranch, deleteBranch } = require('../controllers/branchController');

// All admin routes should be protected
router.use(verifyToken, isAdmin);

// Branch Management
router.get('/branches', getAllBranches);
router.post('/branches', createBranch);
router.put('/branches/:id', updateBranch);
router.delete('/branches/:id', deleteBranch);

// Staff Management
const { getAllStaff, createStaff } = require('../controllers/staffController');
router.get('/staff', getAllStaff);
router.post('/staff', createStaff);

// Package Management
const { getAllPackages, createPackage } = require('../controllers/packageController');
router.get('/packages', getAllPackages);
router.post('/packages', createPackage);

module.exports = router;
