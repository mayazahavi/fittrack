const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  getGenders // נוסיף פונקציה חדשה
} = require("../controllers/profileController");

router.get("/genders", verifyToken, getGenders); // ✅ נוספה תמיכה בהשלמת מגדרים
router.get("/:username", verifyToken, getProfile);
router.post("/", verifyToken, updateProfile);

module.exports = router;
