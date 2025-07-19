const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getFeedbacks,
  getFeedbacksByTrainee, 
  deleteFeedback,
  updateFeedback
} = require("../controllers/feedbackController");
const verifyToken = require("../middleware/auth");
router.get("/", verifyToken, (req, res) => {
  console.log("📥 GET /api/coach/feedback called");
  getFeedbacks(req, res);
});
router.get("/by-trainee", verifyToken, (req, res) => {
  console.log("📥 GET /api/coach/feedback/by-trainee called");
  getFeedbacksByTrainee(req, res);
});
router.post("/", verifyToken, (req, res) => {
  console.log("📝 POST /api/coach/feedback called");
  createFeedback(req, res);
});
router.delete("/:id", verifyToken, (req, res) => {
  console.log("🗑️ DELETE /api/coach/feedback/:id called");
  deleteFeedback(req, res);
});
router.put("/:id", verifyToken, (req, res) => {
  console.log("✏️ PUT /api/coach/feedback/:id called");
  updateFeedback(req, res);
});

module.exports = router;
