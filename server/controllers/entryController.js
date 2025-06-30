const Entry = require("../models/Entry");

// יצירת הזנה חדשה
exports.createEntry = async (req, res) => {
  try {
    const { meals, workout, date, time } = req.body;

    // בדיקת תקינות נתוני הארוחות
    if (!Array.isArray(meals) || meals.some(m => !m.name || typeof m.calories !== "number")) {
      return res.status(400).json({ error: "Invalid meal data format" });
    }

    // חישוב סך הקלוריות
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    // יצירת אובייקט חדש לשמירה
    const newEntry = new Entry({
      meals,                // שומר את מערך הארוחות (עם name ו-calories)
      calories: totalCalories,
      workout,
      date,
      time,
      user: req.user.id     // שיוך למשתמש המחובר
    });

    // שמירה במסד
    await newEntry.save();

    res.status(201).json(newEntry);
  } catch (err) {
    console.error("❌ Error saving entry:", err.message);
    res.status(400).json({ error: err.message });
  }
};
