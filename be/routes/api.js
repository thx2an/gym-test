const express = require('express');
const router = express.Router();

const AuthController = require('../app/Http/Controllers/AuthController');
const RoleController = require('../app/Http/Controllers/RoleController');
const PackageController = require('../app/Http/Controllers/PackageController');
const UserController = require('../app/Http/Controllers/UserController');
const TrainerController = require('../app/Http/Controllers/TrainerController');
const BookingController = require('../app/Http/Controllers/BookingController');
const SessionController = require('../app/Http/Controllers/SessionController');
const PaymentController = require('../app/Http/Controllers/PaymentController');

const { verifyToken, isAdmin } = require('../app/Http/Middleware/AuthMiddleware');

const validate = require('../app/Http/Middleware/ValidateRequest');
const { registerRules, loginRules } = require('../app/Http/Requests/AuthRequest');

// --- Auth Routes (Public) ---
router.post('/auth/register', registerRules, validate, AuthController.register);
router.post('/auth/login', loginRules, validate, AuthController.login);

// --- User Routes (Protected) ---
router.get('/user/profile', verifyToken, UserController.getProfile);
router.post('/user/profile/update', verifyToken, UserController.updateProfile);

// --- Role Routes (Protected/Admin) ---
router.get('/roles', verifyToken, RoleController.getData);
router.post('/roles/add', verifyToken, isAdmin, RoleController.addData);
router.post('/roles/update', verifyToken, isAdmin, RoleController.update);
router.post('/roles/delete', verifyToken, isAdmin, RoleController.destroy);

// --- Package Routes (Protected/Admin) ---
router.get('/packages', verifyToken, PackageController.getData);
router.post('/packages/create', verifyToken, isAdmin, PackageController.create);
router.post('/packages/update', verifyToken, isAdmin, PackageController.update);
router.post('/packages/delete', verifyToken, isAdmin, PackageController.destroy);

// --- Trainer Routes ---
router.post('/trainer/profile', verifyToken, TrainerController.updateProfile); // Create/Update
router.get('/trainers', TrainerController.getTrainers); // Public?
router.post('/trainer/availability', verifyToken, TrainerController.setAvailability);
router.get('/trainer/schedule/:trainerId', TrainerController.getSchedule);

// --- Booking Routes ---
router.get('/booking/slots', verifyToken, BookingController.getAvailableSlots); // ?trainerId=x&date=y
router.post('/booking/create', verifyToken, BookingController.createBooking);
router.get('/booking/my-bookings', verifyToken, BookingController.getMyBookings);

// --- Session/QR Routes ---
router.get('/session/qr/:sessionId', verifyToken, SessionController.getSessionQR);
router.post('/session/checkin', verifyToken, SessionController.verifyCheckIn); // Trainer scans

// --- Payment Routes ---
router.post('/payment/create-link', verifyToken, PaymentController.createPayment);
router.post('/payment/confirm-webhook', PaymentController.confirmPayment); // Public, called by PayOS
router.post('/payment/confirm', verifyToken, PaymentController.confirmPayment); // Manual trigger?
router.post('/payment/refund/request', verifyToken, PaymentController.requestRefund);
router.get('/payment/refunds', verifyToken, isAdmin, PaymentController.getRefunds);

// --- Review Routes ---
const ReviewController = require('../app/Http/Controllers/ReviewController');
router.post('/reviews/add', verifyToken, ReviewController.addReview);
router.get('/reviews/trainer/:trainerId', ReviewController.getTrainerReviews);

// --- Upload Routes ---
const UploadController = require('../app/Http/Controllers/UploadController');
router.post('/upload/image', verifyToken, UploadController.uploader, UploadController.uploadImage);



// --- Statistics Routes (Admin) ---
const StatisticsController = require('../app/Http/Controllers/StatisticsController');
router.get('/admin/dashboard-stats', verifyToken, isAdmin, StatisticsController.getDashboardStats);

// --- Blog Routes ---
const BlogController = require('../app/Http/Controllers/BlogController');
router.get('/blog/categories', BlogController.getCategories);
router.post('/blog/category', verifyToken, isAdmin, BlogController.createCategory);
router.get('/blog/posts', BlogController.getPosts);
router.get('/blog/post/:id', BlogController.getPostDetail);
router.post('/blog/post', verifyToken, isAdmin, BlogController.createPost);

module.exports = router;
