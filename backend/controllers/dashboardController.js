const User = require('../models/User');
const BMIRecord = require('../models/BMIRecord');
const Hydration = require('../models/Hydration');
const Sleep = require('../models/Sleep');
const Activity = require('../models/Activity');
const Mood = require('../models/Mood');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');

/**
 * @route   GET /api/dashboard
 * @desc    Get aggregated dashboard data for the authenticated user
 * @access  Private
 */
exports.getDashboard = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const user = await User.findById(req.user._id).select('-password');

    // 1. Time-aware greeting
    const currentHour = new Date().getHours();
    let greetingPrefix = 'Good morning';
    if (currentHour >= 12 && currentHour < 17) greetingPrefix = 'Good afternoon';
    else if (currentHour >= 17) greetingPrefix = 'Good evening';

    const greeting = `${greetingPrefix}, ${user.name.split(' ')[0]} 👋`;

    // 2. BMI
    const latestBMI = await BMIRecord.findOne({ user: req.user._id }).sort({ date: -1 });

    // 3. Hydration today
    const hydrationLogs = await Hydration.find({
      user: req.user._id,
      dayString: todayStr,
    });
    const todayWaterMl = hydrationLogs.reduce((acc, curr) => acc + curr.amount, 0);
    const waterGoalL = user.profile.waterGoal || 2.0;
    const waterGoalMl = waterGoalL * 1000;
    const hydration = {
      todayL: Number((todayWaterMl / 1000).toFixed(2)),
      goalL: waterGoalL,
      percentage: Math.min(100, Math.round((todayWaterMl / waterGoalMl) * 100)),
      isGoalMet: todayWaterMl >= waterGoalMl,
    };

    // 4. Sleep (latest or today)
    const latestSleep = await Sleep.findOne({ user: req.user._id }).sort({ date: -1 });
    const sleep = {
      record: latestSleep,
      durationHours: latestSleep ? latestSleep.durationHours : null,
      formattedDuration: latestSleep
        ? `${Math.floor(latestSleep.durationHours)}h ${Math.round((latestSleep.durationHours % 1) * 60)}m`
        : 'No log yet',
      quality: latestSleep ? latestSleep.quality : null,
    };

    // 5. Activity today
    const activityLogs = await Activity.find({
      user: req.user._id,
      dayString: todayStr,
    });
    const todayActivityMinutes = activityLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const todaySteps = activityLogs.reduce((acc, curr) => acc + (curr.steps || 0), 0);
    const todayCalories = activityLogs.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);
    const activityGoalMins = user.profile.activityGoal || 30;
    const activity = {
      todayMinutes: todayActivityMinutes,
      goalMinutes: activityGoalMins,
      steps: todaySteps,
      calories: todayCalories,
      percentage: Math.min(100, Math.round((todayActivityMinutes / activityGoalMins) * 100)),
      isGoalMet: todayActivityMinutes >= activityGoalMins,
    };

    // 6. Mood today
    const todayMood = await Mood.findOne({
      user: req.user._id,
      dayString: todayStr,
    }).sort({ date: -1 });

    // 7. Goals today
    const goals = await Goal.find({
      user: req.user._id,
      dayString: todayStr,
    }).sort({ isDailyDefault: -1, createdAt: 1 });

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.completed).length;
    const goalsPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // 8. 4-Pillar Checklist status for today
    const checklist = {
      water: todayWaterMl > 0,
      activity: todayActivityMinutes > 0,
      sleep: latestSleep !== null,
      mood: todayMood !== null,
    };

    // 9. Achievements count
    const unlockedBadgesCount = await Achievement.countDocuments({ user: req.user._id });

    // 10. Motivational Note
    let todayNote = "Small positive habits every day lead to massive wellness transformations!";
    if (hydration.isGoalMet && activity.isGoalMet && checklist.sleep && checklist.mood) {
      todayNote = "🌟 Phenomenal work! You've crushed all your core wellness habits today!";
    } else if (hydration.todayL > 0 || activity.todayMinutes > 0) {
      todayNote = "Great momentum! Keep staying hydrated and moving towards your goals.";
    }

    return res.json({
      success: true,
      greeting,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        xp: user.xp,
        streak: user.streak,
      },
      bmi: latestBMI
        ? {
            value: latestBMI.bmi,
            category: latestBMI.category,
            height: latestBMI.height,
            weight: latestBMI.weight,
            date: latestBMI.date,
          }
        : null,
      hydration,
      sleep,
      activity,
      mood: todayMood
        ? {
            mood: todayMood.mood,
            emoji: todayMood.emoji,
            note: todayMood.note,
          }
        : null,
      goals: {
        total: totalGoals,
        completed: completedGoals,
        percentage: goalsPercentage,
        list: goals,
      },
      checklist,
      unlockedBadgesCount,
      todayNote,
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data.',
    });
  }
};

