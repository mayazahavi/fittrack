const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/profileController");

// 🔵 שליפת פרופיל לפי שם משתמש (לדוגמה: /api/trainee/profile/galzahavi)
router.get("/:username", verifyToken, getProfile);

// 🟢 יצירה או עדכון פרופיל של המשתמש המחובר
router.post("/", verifyToken, updateProfile);

module.exports = router;

