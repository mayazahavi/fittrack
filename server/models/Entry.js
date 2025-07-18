// models/Entry.js

const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  meals: [
    {
      name: String,
      calories: Number,
    },
  ],
  calories: Number,
  workout: String,
  date: String,
  time: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Entry", entrySchema);
