const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  food: String,
  calories: Number,
  workout: String,
  date: String,
  time: String,
});

module.exports = mongoose.model("Entry", entrySchema);
