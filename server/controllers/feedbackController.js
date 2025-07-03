console.log("🧠 feedbackController.js loaded!");


const Feedback = require("../models/Feedback");

async function createFeedback(req, res) {
  try {
    const { traineeId, datetime, tips } = req.body;

    if (!traineeId || !datetime || !tips) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFeedback = new Feedback({
      trainee: traineeId,
      coach: req.user.id,
      datetime: new Date(datetime),
      tips,
    });

    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getFeedbacks(req, res) {
    console.log("📥 getFeedbacks reached!");

  try {
    // בודק שהמשתמש הוא מאמן
    if (req.user.role !== 'coach') {
      return res.status(403).json({ error: "Access denied: Not a coach" });
    }

    // מחזיר רק את הפידבקים ששלח המאמן הנוכחי
    const feedbacks = await Feedback.find({ coach: req.user.id })
      .populate("trainee", "username")
      .sort({ datetime: -1 });

    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { createFeedback, getFeedbacks };
