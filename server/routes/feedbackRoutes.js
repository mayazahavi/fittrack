const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getFeedbacks,
  getFeedbacksByTrainee,  // ✅ נוספה פונקציה חדשה
  deleteFeedback,
  updateFeedback
} = require("../controllers/feedbackController");
const verifyToken = require("../middleware/auth");

console.log("📁 feedbackRoutes.js loaded");

// ✅ שליפת כל הפידבקים של המאמן הנוכחי (coach בלבד)
router.get("/", verifyToken, (req, res) => {
  console.log("📥 GET /api/coach/feedback called");
  getFeedbacks(req, res);
});

// ✅ שליפת כל הפידבקים לפי מתאמן (trainee)
router.get("/by-trainee", verifyToken, (req, res) => {
  console.log("📥 GET /api/coach/feedback/by-trainee called");
  getFeedbacksByTrainee(req, res);
});

// ✅ שליחת פידבק חדש למתאמן
router.post("/", verifyToken, (req, res) => {
  console.log("📝 POST /api/coach/feedback called");
  createFeedback(req, res);
});

// ✅ מחיקת פידבק לפי מזהה
router.delete("/:id", verifyToken, (req, res) => {
  console.log("🗑️ DELETE /api/coach/feedback/:id called");
  deleteFeedback(req, res);
});

// ✅ עריכת פידבק קיים לפי מזהה
router.put("/:id", verifyToken, (req, res) => {
  console.log("✏️ PUT /api/coach/feedback/:id called");
  updateFeedback(req, res);
});

module.exports = router;
