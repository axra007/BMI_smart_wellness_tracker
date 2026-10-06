const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./backend/config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// SERVE FRONTEND
// ===============================

app.use(express.static(path.join(__dirname, 'frontend')));

// ===============================
// API ROUTES
// ===============================

app.use('/api/auth', require('./backend/routes/authRoutes'));
app.use('/api/profile', require('./backend/routes/profileRoutes'));
app.use('/api/bmi', require('./backend/routes/bmiRoutes'));
app.use('/api/hydration', require('./backend/routes/hydrationRoutes'));
app.use('/api/sleep', require('./backend/routes/sleepRoutes'));
app.use('/api/activity', require('./backend/routes/activityRoutes'));
app.use('/api/mood', require('./backend/routes/moodRoutes'));
app.use('/api/goals', require('./backend/routes/goalRoutes'));
app.use('/api/progress', require('./backend/routes/progressRoutes'));
app.use('/api/achievements', require('./backend/routes/achievementRoutes'));
app.use('/api/dashboard', require('./backend/routes/dashboardRoutes'));

// ===============================
// HEALTH CHECK
// ===============================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        app: 'BMI+ Smart Wellness Tracker',
        timestamp: new Date()
    });
});

// ===============================
// FRONTEND FALLBACK
// ===============================

app.get('*', (req, res, next) => {

    // If an API route doesn't exist
    if (req.url.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: 'API route not found'
        });
    }

    // Otherwise serve frontend
    res.sendFile(
        path.join(__dirname, 'frontend', 'index.html')
    );
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {

    console.error(
        'Unhandled Server Error:',
        err.stack || err
    );

    res.status(err.status || 500).json({
        success: false,
        message:
            err.message ||
            'Internal server error occurred.'
    });
});

// ===============================
// START SERVER
// ===============================

// Render provides process.env.PORT.
// For local development, it falls back to port 5000.

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `🚀 BMI+ Server running in ${
            process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
    );

    console.log(
        `📡 Server is ready to receive requests`
    );
});