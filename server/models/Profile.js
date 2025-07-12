const mongoose = require("mongoose");

const traineeProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  age: Number,
  gender: String,
  height: Number,
  weightHistory: [
    {
      weight: Number,
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("TraineeProfile", traineeProfileSchema);
