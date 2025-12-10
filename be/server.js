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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
