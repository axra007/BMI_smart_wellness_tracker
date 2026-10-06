const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    profile: {
      age: { type: Number, min: 1, max: 120, default: null },
      height: { type: Number, min: 30, max: 280, default: null }, // in cm
      weight: { type: Number, min: 10, max: 500, default: null }, // in kg
      activityLevel: {
        type: String,
        enum: ['Low', 'Moderate', 'Active'],
        default: 'Moderate',
      },
      waterGoal: { type: Number, default: 2.0 }, // in Liters
      sleepGoal: { type: Number, default: 8.0 }, // in Hours
      activityGoal: { type: Number, default: 30 }, // in Minutes
      remindersEnabled: { type: Boolean, default: true },
      isProfileComplete: { type: Boolean, default: false },
    },
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: String, // 'YYYY-MM-DD'
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

