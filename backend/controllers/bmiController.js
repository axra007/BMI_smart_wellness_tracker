const BMIRecord = require('../models/BMIRecord');
const User = require('../models/User');
const { awardXP, updateStreak } = require('../utils/gamification');

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * @route   POST /api/bmi
 * @desc    Calculate and save a new BMI record
 * @access  Private
 */
exports.saveBMI = async (req, res) => {
  try {
    const { height, weight, notes } = req.body;

    if (!height || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both height (cm) and weight (kg).',
      });
    }

    const numHeight = Number(height);
    const numWeight = Number(weight);

    if (numHeight < 30 || numHeight > 280) {
      return res.status(400).json({
        success: false,
        message: 'Height must be between 30 cm and 280 cm.',
      });
    }

    if (numWeight < 10 || numWeight > 500) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be between 10 kg and 500 kg.',
      });
    }

    const heightInMeters = numHeight / 100;
    const bmi = Number((numWeight / (heightInMeters * heightInMeters)).toFixed(1));
    const category = getBMICategory(bmi);

    const record = await BMIRecord.create({
      user: req.user._id,
      height: numHeight,
      weight: numWeight,
      bmi,
      category,
      notes: notes || '',
    });

    // Update user profile height & weight
    await User.findByIdAndUpdate(req.user._id, {
      'profile.height': numHeight,
      'profile.weight': numWeight,
    });

    // Gamification: Update streak and award XP (+10 XP)
    await updateStreak(req.user._id);
    const gamify = await awardXP(req.user._id, 10, 'BMI Logged');

    return res.status(201).json({
      success: true,
      message: 'BMI calculated and recorded successfully!',
      record,
      xpGained: 10,
      totalXp: gamify.xp,
      streak: gamify.streak,
      newBadges: gamify.newBadges || [],
    });
  } catch (error) {
    console.error('Save BMI error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error recording BMI.',
    });
  }
};

/**
 * @route   GET /api/bmi/history
 * @desc    Get user BMI history
 * @access  Private
 */
exports.getBMIHistory = async (req, res) => {
  try {
    const history = await BMIRecord.find({ user: req.user._id }).sort({ date: -1 }).limit(50);
    return res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve BMI history.',
    });
  }
};

/**
 * @route   GET /api/bmi
 * @desc    Get latest BMI record
 * @access  Private
 */
exports.getLatestBMI = async (req, res) => {
  try {
    const latest = await BMIRecord.findOne({ user: req.user._id }).sort({ date: -1 });
    return res.json({
      success: true,
      record: latest || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest BMI.',
    });
  }
};

