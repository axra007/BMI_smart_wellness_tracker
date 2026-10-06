const mongoose = require('mongoose');

const bmiRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    height: {
      type: Number,
      required: true,
      min: 30,
      max: 280, // cm
    },
    weight: {
      type: Number,
      required: true,
      min: 10,
      max: 500, // kg
    },
    bmi: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['Underweight', 'Healthy', 'Overweight', 'Obese'],
      required: true,
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

module.exports = mongoose.model('BMIRecord', bmiRecordSchema);

