const express = require("express");
const router = express.Router();
const { createFeedback, getFeedbacks } = require("../controllers/feedbackController");
const verifyToken = require("../middleware/auth");

// החזרת כל הפידבקים ששלח המאמן הנוכחי
router.get("/", verifyToken, getFeedbacks);

// שליחת פידבק חדש
router.post("/", verifyToken, createFeedback);

module.exports = router;
