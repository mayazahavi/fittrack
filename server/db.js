const mongoose = require("mongoose");
require("dotenv").config(); // חשוב שזה יהיה כאן

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI); // שם משתנה צריך להתאים
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}
require("dotenv").config({ path: './server/.env' });
module.exports = connectDB;
