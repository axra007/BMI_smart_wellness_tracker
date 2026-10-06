const User = require('../models/User');
const BMIRecord = require('../models/BMIRecord');
const { awardXP, updateStreak } = require('../utils/gamification');

// Helper to determine category
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const latestBMI = await BMIRecord.findOne({ user: req.user._id }).sort({ date: -1 });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        xp: user.xp,
        streak: user.streak,
        latestBMI: latestBMI ? latestBMI.bmi : null,
        bmiCategory: latestBMI ? latestBMI.category : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile data.',
    });
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Update user profile & setup
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      height,
      weight,
      activityLevel,
      waterGoal,
      sleepGoal,
      activityGoal,
      remindersEnabled,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (age !== undefined) user.profile.age = Number(age);
    if (height !== undefined) user.profile.height = Number(height);
    if (weight !== undefined) user.profile.weight = Number(weight);
    if (activityLevel) user.profile.activityLevel = activityLevel;
    if (waterGoal !== undefined) user.profile.waterGoal = Number(waterGoal);
    if (sleepGoal !== undefined) user.profile.sleepGoal = Number(sleepGoal);
    if (activityGoal !== undefined) user.profile.activityGoal = Number(activityGoal);
    if (remindersEnabled !== undefined) user.profile.remindersEnabled = Boolean(remindersEnabled);

    const wasAlreadyComplete = user.profile.isProfileComplete;
    if (user.profile.age && user.profile.height && user.profile.weight) {
      user.profile.isProfileComplete = true;
    }

    await user.save();

    // If height and weight are provided, also create/sync a BMI record
    let latestBmiDoc = null;
    if (user.profile.height > 0 && user.profile.weight > 0) {
      const heightInMeters = user.profile.height / 100;
      const calculatedBmi = Number((user.profile.weight / (heightInMeters * heightInMeters)).toFixed(1));
      const category = getBMICategory(calculatedBmi);

      latestBmiDoc = await BMIRecord.create({
        user: user._id,
        height: user.profile.height,
        weight: user.profile.weight,
        bmi: calculatedBmi,
        category,
        notes: 'Updated from profile settings',
      });
    }

    let xpResult = { xp: user.xp, newBadges: [] };
    // Award first-time setup XP bonus
    if (!wasAlreadyComplete && user.profile.isProfileComplete) {
      await updateStreak(user._id);
      xpResult = await awardXP(user._id, 30, 'Profile Setup Completed');
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        xp: xpResult.xp || user.xp,
        streak: user.streak,
        latestBMI: latestBmiDoc ? latestBmiDoc.bmi : null,
      },
      newBadges: xpResult.newBadges || [],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile.',
    });
  }
};

