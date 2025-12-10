const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Static Files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Connect DB
connectDB();

// Routes
app.use('/api', apiRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('Gym Test API Running (Laravel Style Structure)');
});

// Rate Limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Init Socket.io
const server = require('http').createServer(app);
const SocketService = require('./app/Services/SocketService');
SocketService.init(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
