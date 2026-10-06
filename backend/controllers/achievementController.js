const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { BADGE_DEFINITIONS, evaluateBadges } = require('../utils/gamification');

/**
 * @route   GET /api/achievements
 * @desc    Get all achievements with user unlocked status
 * @access  Private
 */
exports.getAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Re-evaluate in case any condition is already met
    await evaluateBadges(user);

    const userBadges = await Achievement.find({ user: req.user._id });
    const unlockedMap = {};
    userBadges.forEach((b) => {
      unlockedMap[b.badgeId] = b.unlockedAt;
    });

    const allBadges = BADGE_DEFINITIONS.map((def) => {
      const isUnlocked = Boolean(unlockedMap[def.badgeId]);
      return {
        ...def,
        isUnlocked,
        unlockedAt: unlockedMap[def.badgeId] || null,
      };
    });

    const totalCount = allBadges.length;
    const unlockedCount = allBadges.filter((b) => b.isUnlocked).length;
    const completionRate = Math.round((unlockedCount / totalCount) * 100);

    return res.json({
      success: true,
      totalCount,
      unlockedCount,
      completionRate,
      userXp: user.xp,
      userStreak: user.streak,
      badges: allBadges,
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve achievements.',
    });
  }
};

