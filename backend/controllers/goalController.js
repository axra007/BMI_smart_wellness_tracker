const Goal = require('../models/Goal');
const User = require('../models/User');
const { awardXP, updateStreak } = require('../utils/gamification');

// Helper to seed goals for today if none exist
const ensureGoalsForToday = async (userId) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const count = await Goal.countDocuments({ user: userId, dayString: todayStr });

  if (count === 0) {
    const user = await User.findById(userId);
    const waterGoalL = user?.profile?.waterGoal || 2.0;
    const sleepGoalH = user?.profile?.sleepGoal || 7.0;
    const activityGoalM = user?.profile?.activityGoal || 30;

    const defaults = [
      { title: `Drink ${waterGoalL}L of water`, category: 'hydration', targetValue: waterGoalL * 1000, unit: 'ml', xpReward: 20, isDailyDefault: true },
      { title: `${activityGoalM} mins of physical activity`, category: 'activity', targetValue: activityGoalM, unit: 'min', xpReward: 15, isDailyDefault: true },
      { title: `Log ${sleepGoalH}+ hours of sleep`, category: 'sleep', targetValue: sleepGoalH, unit: 'hrs', xpReward: 15, isDailyDefault: true },
      { title: 'Check in with your mood', category: 'mood', targetValue: 1, unit: 'check', xpReward: 10, isDailyDefault: true },
    ];

    for (const item of defaults) {
      await Goal.create({
        user: userId,
        ...item,
        dayString: todayStr,
      });
    }
  }
};

/**
 * @route   GET /api/goals
 * @desc    Get all goals for today
 * @access  Private
 */
exports.getGoals = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    await ensureGoalsForToday(req.user._id);

    const goals = await Goal.find({
      user: req.user._id,
      dayString: todayStr,
    }).sort({ isDailyDefault: -1, createdAt: 1 });

    const total = goals.length;
    const completedCount = goals.filter((g) => g.completed).length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return res.json({
      success: true,
      total,
      completedCount,
      percentage,
      goals,
    });
  } catch (error) {
    console.error('Get goals error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve goals.',
    });
  }
};

/**
 * @route   POST /api/goals
 * @desc    Create a new goal for today
 * @access  Private
 */
exports.createGoal = async (req, res) => {
  try {
    const { title, category, targetValue, unit, xpReward } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a goal title.',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const goal = await Goal.create({
      user: req.user._id,
      title: title.trim(),
      category: category || 'custom',
      targetValue: targetValue ? Number(targetValue) : 1,
      unit: unit || '',
      xpReward: xpReward ? Number(xpReward) : 20,
      isDailyDefault: false,
      dayString: todayStr,
    });

    return res.status(201).json({
      success: true,
      message: 'New goal added!',
      goal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating goal.',
    });
  }
};

/**
 * @route   PUT /api/goals/:id
 * @desc    Toggle goal completion status
 * @access  Private
 */
exports.toggleGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found.',
      });
    }

    const previouslyCompleted = goal.completed;
    goal.completed = !goal.completed;
    goal.completedAt = goal.completed ? new Date() : null;
    await goal.save();

    let xpGained = 0;
    let gamify = { xp: req.user.xp, streak: req.user.streak, newBadges: [] };

    // Award XP when marking complete
    if (!previouslyCompleted && goal.completed) {
      await updateStreak(req.user._id);
      xpGained = goal.xpReward || 20;

      // Check if ALL goals for today are now complete
      const todayStr = goal.dayString;
      const allTodayGoals = await Goal.find({
        user: req.user._id,
        dayString: todayStr,
      });

      const allCompleted = allTodayGoals.length > 0 && allTodayGoals.every((g) => g.completed);
      if (allCompleted) {
        xpGained += 25; // Bonus for 100% daily completion!
      }

      gamify = await awardXP(req.user._id, xpGained, `Completed Goal: ${goal.title}`);
    }

    return res.json({
      success: true,
      message: goal.completed ? 'Goal marked as complete! 🎉' : 'Goal reopened.',
      goal,
      xpGained,
      totalXp: gamify.xp,
      streak: gamify.streak,
      newBadges: gamify.newBadges || [],
    });
  } catch (error) {
    console.error('Toggle goal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update goal.',
    });
  }
};

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete custom goal
 * @access  Private
 */
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Goal removed successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete goal.',
    });
  }
};

