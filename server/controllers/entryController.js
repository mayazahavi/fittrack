const Entry = require("../models/Entry");

// יצירת הזנה חדשה
exports.createEntry = async (req, res) => {
  try {
    const { meals, workout, date, time } = req.body;

    if (!Array.isArray(meals) || meals.some(m => !m.name || typeof m.calories !== "number")) {
      return res.status(400).json({ error: "Invalid meal data format" });
    }

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    const newEntry = new Entry({
      meals,
      calories: totalCalories,
      workout,
      date,
      time,
      user: req.user.id
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    console.error("❌ Error saving entry:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// קבלת כל ההזנות של המשתמש
exports.getEntries = async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user.id });
    res.status(200).json(entries);
  } catch (err) {
    console.error("❌ Error fetching entries:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// מחיקת הזנה לפי ID
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting entry:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// עדכון הזנה קיימת לפי ID
exports.updateEntry = async (req, res) => {
  try {
    const updatedEntry = await Entry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json(updatedEntry);
  } catch (err) {
    console.error("❌ Error updating entry:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
