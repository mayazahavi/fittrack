const mongoose = require("mongoose");

const weightEntrySchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // הפנייה למודל User
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  height: {
    type: Number, // ס"מ
    required: true,
  },
  weightHistory: [weightEntrySchema], // היסטוריית משקלים
});

module.exports = mongoose.model("Profile", profileSchema);
