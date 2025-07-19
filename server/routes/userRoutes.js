const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { registerUser, loginUser } = require("../controllers/userController");
const User = require("../models/User");
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/trainees", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "coach") {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    const trainees = await User.find({ role: "trainee" }, "_id username").lean();
    res.json(trainees);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trainees" });
  }
});

module.exports = router;
