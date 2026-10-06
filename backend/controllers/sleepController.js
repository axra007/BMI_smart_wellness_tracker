const Sleep = require('../models/Sleep');
const Goal = require('../models/Goal');
const { awardXP, updateStreak } = require('../utils/gamification');

// Helper to calculate duration between bedtime and wake time
const calculateDuration = (bedtime, wakeTime) => {
  const [bHours, bMinutes] = bedtime.split(':').map(Number);
  const [wHours, wMinutes] = wakeTime.split(':').map(Number);

  let bedMinutes = bHours * 60 + bMinutes;
  let wakeMinutes = wHours * 60 + wMinutes;

  if (wakeMinutes < bedMinutes) {
    // Crosses midnight
    wakeMinutes += 24 * 60;
  }

  const diffMinutes = wakeMinutes - bedMinutes;
  return Number((diffMinutes / 60).toFixed(1));
};

/**
 * @route   POST /api/sleep
 * @desc    Log sleep record
 * @access  Private
 */
exports.logSleep = async (req, res) => {
  try {
    const { bedtime, wakeTime, quality, notes } = req.body;

    if (!bedtime || !wakeTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both bedtime and wake-up time.',
      });
    }

    const durationHours = calculateDuration(bedtime, wakeTime);

    if (durationHours <= 0 || durationHours > 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sleep duration calculated. Please verify times.',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const record = await Sleep.create({
      user: req.user._id,
      bedtime,
      wakeTime,
      durationHours,
      quality: quality || 'Good',
      notes: notes || '',
      dayString: todayStr,
    });

    // Auto complete daily sleep goal
    if (durationHours >= 7) {
      await Goal.findOneAndUpdate(
        { user: req.user._id, category: 'sleep', dayString: todayStr, completed: false },
        { completed: true, completedAt: new Date() }
      );
    }

    // Update streak and award XP
    await updateStreak(req.user._id);
    const xpGained = durationHours >= 7 ? 15 : 10;
    const gamify = await awardXP(req.user._id, xpGained, 'Sleep Logged');

    return res.status(201).json({
      success: true,
      message: `Sleep logged: ${durationHours} hours!`,
      record,
      xpGained,
      totalXp: gamify.xp,
      streak: gamify.streak,
      newBadges: gamify.newBadges || [],
    });
  } catch (error) {
    console.error('Log sleep error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error recording sleep.',
    });
  }
};

/**
 * @route   GET /api/sleep
 * @desc    Get sleep records & weekly overview
 * @access  Private
 */
exports.getSleep = async (req, res) => {
  try {
    const latestSleep = await Sleep.findOne({ user: req.user._id }).sort({ date: -1 });

    const pastDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      pastDays.push(d.toISOString().split('T')[0]);
    }

    const weeklyLogs = await Sleep.find({
      user: req.user._id,
      dayString: { $in: pastDays },
    });

    const weeklyData = pastDays.map((day) => {
      const dayLog = weeklyLogs.find((log) => log.dayString === day);
      const dayName = new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date: day,
        dayName,
        duration: dayLog ? dayLog.durationHours : 0,
        quality: dayLog ? dayLog.quality : null,
      };
    });

    const loggedEntries = weeklyData.filter((d) => d.duration > 0);
    const avgDuration =
      loggedEntries.length > 0
        ? Number((loggedEntries.reduce((acc, curr) => acc + curr.duration, 0) / loggedEntries.length).toFixed(1))
        : 0;

    const avgHours = Math.floor(avgDuration);
    const avgMins = Math.round((avgDuration - avgHours) * 60);
    const feedback =
      loggedEntries.length > 0
        ? `Your average sleep this week is ${avgHours}h ${avgMins}m.`
        : 'Log your sleep to see weekly insights and trends.';

    return res.json({
      success: true,
      latestSleep,
      avgDuration,
      feedback,
      weeklyData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sleep data.',
    });
  }
};

