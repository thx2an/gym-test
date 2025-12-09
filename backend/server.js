const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./src/config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', require('./src/routes/userRoutes'));
app.use('/api/membership', require('./src/routes/membershipRoutes'));
app.use('/api/payment', require('./src/routes/paymentRoutes'));
app.use('/api/invoices', require('./src/routes/invoiceRoutes'));
app.use('/api/trainers', require('./src/routes/trainerRoutes'));
app.use('/api/booking', require('./src/routes/bookingRoutes'));
app.use('/api/sessions', require('./src/routes/sessionRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));
app.get('/', (req, res) => {
    res.send('GymNexus Backend is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
