const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/profileController");

// ✅ שליפת פרופיל לפי הטוקן
router.get("/", verifyToken, getProfile);

// ✅ עדכון או יצירת פרופיל
router.post("/", verifyToken, updateProfile);

module.exports = router;
