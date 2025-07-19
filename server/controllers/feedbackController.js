const Feedback = require("../models/Feedback");
async function createFeedback(req, res) {
  try {
    const { traineeId, datetime, tips } = req.body;
    if (!traineeId || !datetime || !tips) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newFeedback = new Feedback({
      trainee: traineeId,
      coach: req.user?.id || "unknown",
      datetime: new Date(datetime),
      tips,
    });
    await newFeedback.save();
    console.log("✅ Feedback saved successfully!");
    res.status(201).json(newFeedback);
  } catch (err) {
    console.error("❌ Error saving feedback:", err);
    res.status(500).json({ error: "Server error" });
  }
}
async function getFeedbacks(req, res) {
  console.log("📥 getFeedbacks CALLED");

  try {
    if (req.user.role !== "coach") {
      return res.status(403).json({ error: "Access denied: Not a coach" });
    }

    const feedbacks = await Feedback.find({ coach: req.user.id })
      .populate("trainee", "username")
      .sort({ datetime: -1 });

    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("❌ Error fetching feedbacks:", err);
    res.status(500).json({ error: "Server error" });
  }
}
async function getFeedbacksByTrainee(req, res) {
  try {
    const traineeId = req.query.traineeId;
    if (!traineeId) {
      return res.status(400).json({ error: "Missing traineeId in query" });
    }
    const feedbacks = await Feedback.find({ trainee: traineeId })
      .sort({ datetime: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("❌ Error fetching feedbacks by trainee:", err);
    res.status(500).json({ error: "Server error" });
  }
}
async function deleteFeedback(req, res) {
  const feedbackId = req.params.id;
  try {
    const deleted = await Feedback.findOneAndDelete({
      _id: feedbackId,
      coach: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ error: "Feedback not found or not yours" });
    }
    console.log("🗑️ Feedback deleted:", feedbackId);
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting feedback:", err);
    res.status(500).json({ error: "Server error" });
  }
}
async function updateFeedback(req, res) {
  const feedbackId = req.params.id;
  const { datetime, tips } = req.body;
  try {
    const updated = await Feedback.findOneAndUpdate(
      { _id: feedbackId, coach: req.user.id },
      {
        datetime: new Date(datetime),
        tips: {
          nutrition: tips?.nutrition || "",
          exercise: tips?.exercise || "",
          general: tips?.general || "",
        }
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Feedback not found or not yours" });
    }
    console.log("✏️ Feedback updated:", updated._id);
    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Error updating feedback:", err);
    res.status(500).json({ error: "Server error" });
  }
}
module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedbacksByTrainee, // ✅ ייצוא חדש
  deleteFeedback,
  updateFeedback
};
