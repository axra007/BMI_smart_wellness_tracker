const mongoose = require('mongoose');

const hydrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify water amount in ml'],
      min: [50, 'Minimum log is 50 ml'],
      max: [5000, 'Maximum single log is 5000 ml'],
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

module.exports = mongoose.model('Hydration', hydrationSchema);

