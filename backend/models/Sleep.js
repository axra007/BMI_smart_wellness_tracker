const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bedtime: {
      type: String, // HH:MM
      required: true,
    },
    wakeTime: {
      type: String, // HH:MM
      required: true,
    },
    durationHours: {
      type: Number,
      required: true,
      min: 0.5,
      max: 24,
    },
    quality: {
      type: String,
      enum: ['Poor', 'Fair', 'Good', 'Excellent'],
      default: 'Good',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
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

module.exports = mongoose.model('Sleep', sleepSchema);

