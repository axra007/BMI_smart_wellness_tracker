const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb+srv://axra87662812_db_user:PFIXsjDAJ9MVjq5q@bmi.bc2img2.mongodb.net/BMI?appName=BMI';
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ Please verify your MONGODB_URI in the .env file or ensure your MongoDB service or Atlas connection string is active.');
  }
};

module.exports = connectDB;

