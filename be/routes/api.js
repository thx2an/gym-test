const express = require('express');
const router = express.Router();

const AuthController = require('../app/Http/Controllers/AuthController');
const RoleController = require('../app/Http/Controllers/RoleController');
const PackageController = require('../app/Http/Controllers/PackageController');
const UserController = require('../app/Http/Controllers/UserController');

const { verifyToken, isAdmin } = require('../app/Http/Middleware/AuthMiddleware');

// Auth Routes (Public)
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// User Routes (Protected)
router.get('/user/profile', verifyToken, UserController.getProfile);
router.post('/user/profile/update', verifyToken, UserController.updateProfile);

// Role Routes (Protected)
router.get('/roles', verifyToken, RoleController.getData);
router.post('/roles/add', verifyToken, isAdmin, RoleController.addData); // Admin only recommended
router.post('/roles/update', verifyToken, isAdmin, RoleController.update);
router.post('/roles/delete', verifyToken, isAdmin, RoleController.destroy);

// Package Routes (Protected/Admin)
router.get('/packages', verifyToken, PackageController.getData); // Publicly viewable maybe? kept protected for now
router.post('/packages/create', verifyToken, isAdmin, PackageController.create);
router.post('/packages/update/:id', verifyToken, isAdmin, PackageController.update); // Supports params
router.post('/packages/update', verifyToken, isAdmin, PackageController.update);     // Supports body
router.post('/packages/delete/:id', verifyToken, isAdmin, PackageController.destroy);
router.post('/packages/delete', verifyToken, isAdmin, PackageController.destroy);

module.exports = router;
