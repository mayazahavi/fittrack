const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getFeedbacks,
  getFeedbacksByTrainee,
  deleteFeedback,
  updateFeedback,
  markFeedbackAsRead // ✅ הוספה של הפונקציה החדשה
} = require("../controllers/feedbackController");

// 📥 כל הפידבקים של המאמן
router.get("/", (req, res) => {
  console.log("📥 GET /api/coach/feedback called");
  getFeedbacks(req, res);
});

// 📥 פידבקים של מתאמן ספציפי
router.get("/by-trainee", (req, res) => {
  console.log("📥 GET /api/coach/feedback/by-trainee called");
  getFeedbacksByTrainee(req, res);
});

// 📝 יצירת פידבק
router.post("/", (req, res) => {
  console.log("📝 POST /api/coach/feedback called");
  createFeedback(req, res);
});

// 🗑️ מחיקת פידבק
router.delete("/:id", (req, res) => {
  console.log("🗑️ DELETE /api/coach/feedback/:id called");
  deleteFeedback(req, res);
});

// ✏️ עדכון פידבק
router.put("/:id", (req, res) => {
  console.log("✏️ PUT /api/coach/feedback/:id called");
  updateFeedback(req, res);
});

// ✅ סימון כנקרא (על ידי המתאמן)
router.patch("/:id/mark-read", (req, res) => {
  console.log("📬 PATCH /api/coach/feedback/:id/mark-read called");
  markFeedbackAsRead(req, res); // ✅ קריאה לפונקציה שהוגדרה ב-controller
});

module.exports = router;
