const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Goal = require('../models/Goal');

const mongoose = require('mongoose');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'bmi_plus_super_secret_jwt_key_2026_academic_project',
    { expiresIn: '30d' }
  );
};

// Seed standard daily goals for a new user
const seedDailyGoalsForUser = async (userId) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaults = [
    { title: 'Drink 2.0L of water', category: 'hydration', targetValue: 2000, unit: 'ml', xpReward: 20, isDailyDefault: true },
    { title: '30 mins of physical activity', category: 'activity', targetValue: 30, unit: 'min', xpReward: 15, isDailyDefault: true },
    { title: 'Log 7+ hours of sleep', category: 'sleep', targetValue: 7, unit: 'hrs', xpReward: 15, isDailyDefault: true },
    { title: 'Check in with your mood', category: 'mood', targetValue: 1, unit: 'check', xpReward: 10, isDailyDefault: true },
  ];

  for (const item of defaults) {
    await Goal.create({
      user: userId,
      ...item,
      dayString: todayStr,
    });
  }
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please ensure MongoDB is running locally on port 27017 or set your MONGODB_URI in .env (MongoDB Atlas).',
      });
    }

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      xp: 0,
      streak: 0,
    });

    // Seed initial daily goals
    try {
      await seedDailyGoalsForUser(user._id);
    } catch (e) {
      console.error('Initial goal seed warning:', e.message);
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account successfully created!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        xp: user.xp,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please ensure MongoDB is running locally on port 27017 or set your MONGODB_URI in .env (MongoDB Atlas).',
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        xp: user.xp,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve user information.',
    });
  }
};

