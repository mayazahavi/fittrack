const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  trainee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",      
    required: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  datetime: {
    type: Date,
    required: true,
  },
  tips: {
    nutrition: { type: String, default: "" },
    exercise: { type: String, default: "" },
    general: { type: String, default: "" }
  },
  readByTrainee: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", FeedbackSchema);
