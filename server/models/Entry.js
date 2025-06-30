const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  meals: [String], // רשימת שמות המאכלים
  calories: Number, // סך הקלוריות הכולל
  caloriesPerMeal: [ // מערך עם שם וקלוריות של כל מאכל
    {
      name: String,
      calories: Number
    }
  ],
  workout: String, // סוג האימון
  date: String,    // תאריך
  time: String,    // שעה

  // שיוך למשתמש
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

module.exports = mongoose.model("Entry", entrySchema);
