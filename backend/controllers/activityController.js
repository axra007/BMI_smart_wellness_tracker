const Activity = require('../models/Activity');
const User = require('../models/User');
const Goal = require('../models/Goal');
const { awardXP, updateStreak } = require('../utils/gamification');

/**
 * @route   POST /api/activity
 * @desc    Log physical activity
 * @access  Private
 */
exports.logActivity = async (req, res) => {
  try {
    const { activityType, durationMinutes, steps, caloriesBurned, notes } = req.body;

    if (!activityType || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Please provide activity type and duration in minutes.',
      });
    }

    const duration = Number(durationMinutes);
    if (duration <= 0 || duration > 1440) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 1 and 1440 minutes.',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const record = await Activity.create({
      user: req.user._id,
      activityType: activityType.trim(),
      durationMinutes: duration,
      steps: steps ? Number(steps) : 0,
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : Math.round(duration * 6.5), // estimated calories if not given
      notes: notes || '',
      dayString: todayStr,
    });

    const user = await User.findById(req.user._id);
    const goalMins = user.profile.activityGoal || 30;

    // Get today's total
    const todayLogs = await Activity.find({
      user: user._id,
      dayString: todayStr,
    });
    const todayTotalMinutes = todayLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    // Auto complete daily activity goal if target reached
    if (todayTotalMinutes >= goalMins) {
      await Goal.findOneAndUpdate(
        { user: user._id, category: 'activity', dayString: todayStr, completed: false },
        { completed: true, completedAt: new Date() }
      );
    }

    // Update streak and award XP
    await updateStreak(user._id);
    const xpGained = duration >= 30 ? 20 : 15;
    const gamify = await awardXP(user._id, xpGained, 'Activity Logged');

    return res.status(201).json({
      success: true,
      message: `Activity logged: ${duration} minutes!`,
      record,
      todayTotalMinutes,
      goalMins,
      percentage: Math.min(100, Math.round((todayTotalMinutes / goalMins) * 100)),
      xpGained,
      totalXp: gamify.xp,
      streak: gamify.streak,
      newBadges: gamify.newBadges || [],
    });
  } catch (error) {
    console.error('Log activity error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error recording activity.',
    });
  }
};

/**
 * @route   GET /api/activity
 * @desc    Get activity records & weekly overview
 * @access  Private
 */
exports.getActivity = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const user = await User.findById(req.user._id);
    const goalMins = user.profile.activityGoal || 30;

    const todayLogs = await Activity.find({
      user: req.user._id,
      dayString: todayStr,
    }).sort({ date: -1 });

    const todayTotalMinutes = todayLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const todayTotalSteps = todayLogs.reduce((acc, curr) => acc + (curr.steps || 0), 0);
    const todayCalories = todayLogs.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);

    // Weekly history
    const pastDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      pastDays.push(d.toISOString().split('T')[0]);
    }

    const weeklyLogs = await Activity.find({
      user: req.user._id,
      dayString: { $in: pastDays },
    });

    const weeklyData = pastDays.map((day) => {
      const dayLogs = weeklyLogs.filter((log) => log.dayString === day);
      const totalMins = dayLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const dayName = new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date: day,
        dayName,
        durationMinutes: totalMins,
      };
    });

    return res.json({
      success: true,
      todayTotalMinutes,
      todayTotalSteps,
      todayCalories,
      goalMins,
      percentage: Math.min(100, Math.round((todayTotalMinutes / goalMins) * 100)),
      todayLogs,
      weeklyData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity data.',
    });
  }
};

