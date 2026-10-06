const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please specify a goal title'],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      enum: ['hydration', 'activity', 'sleep', 'mood', 'bmi', 'custom', 'wellness'],
      default: 'custom',
    },
    targetValue: {
      type: Number,
      default: 1,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    xpReward: {
      type: Number,
      default: 20,
    },
    isDailyDefault: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    dayString: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', goalSchema);

