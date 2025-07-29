const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  meals: [
    {
      name: String,       // שם המאכל
      amount: Number,     // כמות (למשל 100)
      unit: String,       // יחידה (למשל grams)
      calories: Number,   // ערך קלורי
    },
  ],
  calories: Number,       // סך כל הקלוריות
  workout: String,        // סוג אימון
  date: String,
  time: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Entry", entrySchema);
