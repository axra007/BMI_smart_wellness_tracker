const Mood = require('../models/Mood');
const Goal = require('../models/Goal');
const { awardXP, updateStreak } = require('../utils/gamification');

const MOOD_MAP = {
  Great: { emoji: '😄', score: 5 },
  Good: { emoji: '🙂', score: 4 },
  Okay: { emoji: '😐', score: 3 },
  Low: { emoji: '😕', score: 2 },
  Stressed: { emoji: '😣', score: 1 },
};

/**
 * @route   POST /api/mood
 * @desc    Record daily mood check-in
 * @access  Private
 */
exports.recordMood = async (req, res) => {
  try {
    const { mood, note } = req.body;

    if (!mood || !MOOD_MAP[mood]) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid mood: Great, Good, Okay, Low, or Stressed.',
      });
    }

    const { emoji, score } = MOOD_MAP[mood];
    const todayStr = new Date().toISOString().split('T')[0];

    const record = await Mood.create({
      user: req.user._id,
      mood,
      emoji,
      score,
      note: note || '',
      dayString: todayStr,
    });

    // Auto complete daily mood check-in goal
    await Goal.findOneAndUpdate(
      { user: req.user._id, category: 'mood', dayString: todayStr, completed: false },
      { completed: true, completedAt: new Date() }
    );

    // Update streak and award XP
    await updateStreak(req.user._id);
    const gamify = await awardXP(req.user._id, 10, 'Mood Check-in');

    return res.status(201).json({
      success: true,
      message: `Mood recorded: ${emoji} ${mood}!`,
      record,
      xpGained: 10,
      totalXp: gamify.xp,
      streak: gamify.streak,
      newBadges: gamify.newBadges || [],
    });
  } catch (error) {
    console.error('Record mood error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error recording mood.',
    });
  }
};

/**
 * @route   GET /api/mood
 * @desc    Get mood history & today's mood
 * @access  Private
 */
exports.getMood = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const todayMood = await Mood.findOne({
      user: req.user._id,
      dayString: todayStr,
    }).sort({ date: -1 });

    const recentMoods = await Mood.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    return res.json({
      success: true,
      todayMood,
      recentMoods,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve mood data.',
    });
  }
};

