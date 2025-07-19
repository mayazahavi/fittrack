const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/profileController");
router.get("/:username", verifyToken, getProfile);
router.post("/", verifyToken, updateProfile);
module.exports = router;

