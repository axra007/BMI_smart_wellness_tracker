const Hydration = require('../models/Hydration');
const User = require('../models/User');
const Goal = require('../models/Goal');
const { awardXP, updateStreak } = require('../utils/gamification');

/**
 * @route   POST /api/hydration
 * @desc    Log water intake
 * @access  Private
 */
exports.addHydration = async (req, res) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid water amount in ml.',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const record = await Hydration.create({
      user: req.user._id,
      amount: numAmount,
      dayString: todayStr,
    });

    // Calculate today's new total
    const todayLogs = await Hydration.find({
      user: req.user._id,
      dayString: todayStr,
    });
    const todayTotalMl = todayLogs.reduce((acc, curr) => acc + curr.amount, 0);

    const user = await User.findById(req.user._id);
    const waterGoalMl = (user.profile.waterGoal || 2.0) * 1000;

    // Update streak
    await updateStreak(user._id);

    // Check if water goal just reached
    let xpGained = 10;
    if (todayTotalMl >= waterGoalMl) {
      // Auto complete daily water goal if exists
      const dailyWaterGoal = await Goal.findOne({
        user: user._id,
        category: 'hydration',
        dayString: todayStr,
      });

      if (dailyWaterGoal && !dailyWaterGoal.completed) {
        dailyWaterGoal.completed = true;
        dailyWaterGoal.completedAt = new Date();
        await dailyWaterGoal.save();
        xpGained += 20; // Bonus for goal completion
      }
    }

    const gamify = await awardXP(user._id, xpGained, 'Hydration Logged');

    return res.status(201).json({
      success: true,
      message: `Added ${numAmount} ml of water!`,
      record,
      todayTotalMl,
      todayTotalL: Number((todayTotalMl / 1000).toFixed(2)),
      goalL: user.profile.waterGoal || 2.0,
      percentage: Math.min(100, Math.round((todayTotalMl / waterGoalMl) * 100)),
      xpGained,
      totalXp: gamify.xp,
      streak: gamify.streak,
      newBadges: gamify.newBadges || [],
    });
  } catch (error) {
    console.error('Add hydration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error recording hydration.',
    });
  }
};

/**
 * @route   GET /api/hydration
 * @desc    Get today's hydration and past 7 days history
 * @access  Private
 */
exports.getHydration = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const user = await User.findById(req.user._id);
    const goalL = user.profile.waterGoal || 2.0;
    const goalMl = goalL * 1000;

    // Today's logs
    const todayLogs = await Hydration.find({
      user: req.user._id,
      dayString: todayStr,
    }).sort({ date: -1 });

    const todayTotalMl = todayLogs.reduce((acc, curr) => acc + curr.amount, 0);

    // 7-day history
    const pastDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      pastDays.push(d.toISOString().split('T')[0]);
    }

    const weeklyLogs = await Hydration.find({
      user: req.user._id,
      dayString: { $in: pastDays },
    });

    const weeklyData = pastDays.map((day) => {
      const dayLogs = weeklyLogs.filter((log) => log.dayString === day);
      const total = dayLogs.reduce((acc, curr) => acc + curr.amount, 0);
      const dayName = new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date: day,
        dayName,
        amountMl: total,
        amountL: Number((total / 1000).toFixed(2)),
      };
    });

    return res.json({
      success: true,
      todayTotalMl,
      todayTotalL: Number((todayTotalMl / 1000).toFixed(2)),
      goalL,
      percentage: Math.min(100, Math.round((todayTotalMl / goalMl) * 100)),
      todayLogs,
      weeklyData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hydration data.',
    });
  }
};

