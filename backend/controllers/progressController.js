const BMIRecord = require('../models/BMIRecord');
const Hydration = require('../models/Hydration');
const Sleep = require('../models/Sleep');
const Activity = require('../models/Activity');
const Mood = require('../models/Mood');
const Goal = require('../models/Goal');
const User = require('../models/User');

/**
 * @route   GET /api/progress
 * @desc    Get aggregated analytics & charts data for Today/Week/Month
 * @access  Private
 */
exports.getProgress = async (req, res) => {
  try {
    const { timeframe = 'week' } = req.query; // 'today', 'week', 'month'
    const user = await User.findById(req.user._id);

    let numDays = 7;
    if (timeframe === 'today') numDays = 1;
    if (timeframe === 'month') numDays = 30;

    const dateList = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateList.push(d.toISOString().split('T')[0]);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    // 1. Hydration aggregated
    const hydrationLogs = await Hydration.find({
      user: req.user._id,
      dayString: { $in: dateList },
    });
    const waterGoalMl = (user.profile.waterGoal || 2.0) * 1000;
    const waterByDay = dateList.map((day) => {
      const logs = hydrationLogs.filter((h) => h.dayString === day);
      const total = logs.reduce((acc, curr) => acc + curr.amount, 0);
      return {
        date: day,
        label: new Date(day + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: numDays <= 7 ? 'short' : undefined,
          month: numDays > 7 ? 'short' : undefined,
          day: numDays > 7 ? 'numeric' : undefined,
        }),
        liters: Number((total / 1000).toFixed(2)),
      };
    });

    // 2. Sleep aggregated
    const sleepLogs = await Sleep.find({
      user: req.user._id,
      dayString: { $in: dateList },
    });
    const sleepByDay = dateList.map((day) => {
      const log = sleepLogs.find((s) => s.dayString === day);
      return {
        date: day,
        label: new Date(day + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: numDays <= 7 ? 'short' : undefined,
          month: numDays > 7 ? 'short' : undefined,
          day: numDays > 7 ? 'numeric' : undefined,
        }),
        hours: log ? log.durationHours : 0,
      };
    });

    // 3. Activity aggregated
    const activityLogs = await Activity.find({
      user: req.user._id,
      dayString: { $in: dateList },
    });
    const activityByDay = dateList.map((day) => {
      const logs = activityLogs.filter((a) => a.dayString === day);
      const totalMins = logs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      return {
        date: day,
        label: new Date(day + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: numDays <= 7 ? 'short' : undefined,
          month: numDays > 7 ? 'short' : undefined,
          day: numDays > 7 ? 'numeric' : undefined,
        }),
        minutes: totalMins,
      };
    });

    // 4. BMI Records Trend (up to 20 recent records)
    const bmiRecords = await BMIRecord.find({ user: req.user._id })
      .sort({ date: 1 })
      .limit(30);

    const bmiTrend = bmiRecords.map((r) => ({
      date: r.dayString || r.date.toISOString().split('T')[0],
      bmi: r.bmi,
      weight: r.weight,
      category: r.category,
    }));

    // 5. Mood distribution
    const moodLogs = await Mood.find({
      user: req.user._id,
      dayString: { $in: dateList },
    });
    const moodCounts = {
      Great: 0,
      Good: 0,
      Okay: 0,
      Low: 0,
      Stressed: 0,
    };
    moodLogs.forEach((m) => {
      if (moodCounts[m.mood] !== undefined) {
        moodCounts[m.mood]++;
      }
    });

    // 6. Summary percentages over the period
    const totalDays = dateList.length;
    const waterDaysMet = waterByDay.filter((w) => w.liters >= (user.profile.waterGoal || 2.0)).length;
    const sleepDaysMet = sleepByDay.filter((s) => s.hours >= (user.profile.sleepGoal || 7.0)).length;
    const activityDaysMet = activityByDay.filter((a) => a.minutes >= (user.profile.activityGoal || 30)).length;

    const totalGoalsInPeriod = await Goal.countDocuments({
      user: req.user._id,
      dayString: { $in: dateList },
    });
    const completedGoalsInPeriod = await Goal.countDocuments({
      user: req.user._id,
      dayString: { $in: dateList },
      completed: true,
    });

    const summary = {
      waterPercentage: Math.round((waterDaysMet / totalDays) * 100),
      sleepPercentage: Math.round((sleepDaysMet / totalDays) * 100),
      activityPercentage: Math.round((activityDaysMet / totalDays) * 100),
      goalsPercentage:
        totalGoalsInPeriod > 0
          ? Math.round((completedGoalsInPeriod / totalGoalsInPeriod) * 100)
          : 0,
    };

    return res.json({
      success: true,
      timeframe,
      summary,
      waterByDay,
      sleepByDay,
      activityByDay,
      bmiTrend,
      moodCounts,
    });
  } catch (error) {
    console.error('Progress analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate progress analytics.',
    });
  }
};

