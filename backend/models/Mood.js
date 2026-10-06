const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mood: {
      type: String,
      enum: ['Great', 'Good', 'Okay', 'Low', 'Stressed'],
      required: [true, 'Please select your mood'],
    },
    emoji: {
      type: String,
      default: '🙂',
    },
    score: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Note cannot exceed 500 characters'],
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

module.exports = mongoose.model('Mood', moodSchema);

