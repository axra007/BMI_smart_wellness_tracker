const User = require('../models/User');
const Achievement = require('../models/Achievement');

// Available badge definitions
const BADGE_DEFINITIONS = [
  {
    badgeId: 'first_step',
    title: 'First Step',
    description: 'Logged your very first wellness record in BMI+',
    icon: '🌱',
    category: 'Milestone',
  },
  {
    badgeId: 'bmi_explorer',
    title: 'BMI Explorer',
    description: 'Calculated and logged your first BMI measurement',
    icon: '🧮',
    category: 'BMI',
  },
  {
    badgeId: 'hydration_hero',
    title: 'Hydration Hero',
    description: 'Completed your daily water intake target',
    icon: '💧',
    category: 'Hydration',
  },
  {
    badgeId: 'sleep_champion',
    title: 'Sleep Champion',
    description: 'Logged a restful sleep of 7+ hours',
    icon: '😴',
    category: 'Sleep',
  },
  {
    badgeId: 'active_mover',
    title: 'Active Mover',
    description: 'Logged 30+ minutes of physical activity in a single day',
    icon: '🏃',
    category: 'Activity',
  },
  {
    badgeId: 'mindful_soul',
    title: 'Mindful Soul',
    description: 'Completed a daily mood check-in',
    icon: '😊',
    category: 'Mood',
  },
  {
    badgeId: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Completed all your daily wellness goals',
    icon: '🎯',
    category: 'Goals',
  },
  {
    badgeId: 'streak_3',
    title: 'Consistency Starter',
    description: 'Maintained a 3-day wellness streak',
    icon: '⚡',
    category: 'Streak',
  },
  {
    badgeId: 'streak_7',
    title: '7 Day Streak',
    description: 'Maintained a 7-day wellness streak',
    icon: '🔥',
    category: 'Streak',
  },
  {
    badgeId: 'streak_30',
    title: '30 Day Master',
    description: 'Maintained a legendary 30-day streak',
    icon: '👑',
    category: 'Streak',
  },
  {
    badgeId: 'xp_100',
    title: 'XP Novice',
    description: 'Earned your first 100 Wellness XP',
    icon: '⭐',
    category: 'XP',
  },
  {
    badgeId: 'xp_500',
    title: 'XP Enthusiast',
    description: 'Reached 500 Wellness XP',
    icon: '🌟',
    category: 'XP',
  },
  {
    badgeId: 'xp_1000',
    title: 'Wellness Legend',
    description: 'Reached 1,000+ Wellness XP',
    icon: '🏆',
    category: 'XP',
  },
];

/**
 * Updates user streak based on activity date
 */
async function updateStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return 0;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!user.lastActiveDate) {
    user.streak = 1;
    user.lastActiveDate = todayStr;
  } else if (user.lastActiveDate === todayStr) {
    // Already active today, streak remains unchanged
  } else if (user.lastActiveDate === yesterdayStr) {
    user.streak += 1;
    user.lastActiveDate = todayStr;
  } else {
    // Streak was broken
    user.streak = 1;
    user.lastActiveDate = todayStr;
  }

  await user.save();
  return user.streak;
}

/**
 * Awards XP to user and triggers badge evaluation
 */
async function awardXP(userId, amount, reason = '') {
  const user = await User.findById(userId);
  if (!user) return { user: null, newBadges: [] };

  user.xp = (user.xp || 0) + amount;
  await user.save();

  // Evaluate badges
  const newBadges = await evaluateBadges(user);

  return {
    xp: user.xp,
    streak: user.streak,
    newBadges,
  };
}

/**
 * Evaluates conditions and unlocks any new achievements
 */
async function evaluateBadges(user) {
  const userId = user._id;
  const existingBadges = await Achievement.find({ user: userId });
  const existingSet = new Set(existingBadges.map((b) => b.badgeId));
  const newBadges = [];

  const unlock = async (badgeId) => {
    if (existingSet.has(badgeId)) return;
    const def = BADGE_DEFINITIONS.find((b) => b.badgeId === badgeId);
    if (!def) return;

    try {
      const created = await Achievement.create({
        user: userId,
        badgeId: def.badgeId,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
      });
      existingSet.add(badgeId);
      newBadges.push(created);
    } catch (e) {
      // Ignored if duplicate key
    }
  };

  // Streak Badges
  if (user.streak >= 1) await unlock('first_step');
  if (user.streak >= 3) await unlock('streak_3');
  if (user.streak >= 7) await unlock('streak_7');
  if (user.streak >= 30) await unlock('streak_30');

  // XP Badges
  if (user.xp >= 100) await unlock('xp_100');
  if (user.xp >= 500) await unlock('xp_500');
  if (user.xp >= 1000) await unlock('xp_1000');

  return newBadges;
}

module.exports = {
  BADGE_DEFINITIONS,
  updateStreak,
  awardXP,
  evaluateBadges,
};

