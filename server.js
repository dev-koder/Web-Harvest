require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'harvest-harmony-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));  // Serve static files (CSS, JS, images)

// MongoDB Connection with SSL options
const mongooseOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server running without database connection');
    console.log('📝 Check MONGODB_TROUBLESHOOTING.md for solutions');
});

// Import routes
const machineRoutes = require('./routes/machines');
const bookingRoutes = require('./routes/bookings');
const favoriteRoutes = require('./routes/favorites');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/machines', machineRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/auth', authRoutes);

// Root route - Render EJS template
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Harvest Harmony - Agricultural Machinery Rental Platform',
        user: req.session.userId ? {
            id: req.session.userId,
            username: req.session.username,
            role: req.session.role
        } : null
    });
});

// Login page
app.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('login', { title: 'Login - Harvest Harmony' });
});

// Register page
app.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('register', { title: 'Register - Harvest Harmony' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Harvest Harmony API is running',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌾 Harvest Harmony Backend is ready!`);
});
