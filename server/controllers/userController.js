const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validRoles = ["trainee", "coach"];
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    // בדיקה אם התפקיד תקין
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ registerUser error:", err);
    res.status(500).json({ error: err.message });
  }
};
const loginUser = async (req, res) => {
  const { username, password, role } = req.body;
  console.log("Login attempt:", { username, password, role });
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch || user.role !== role) {
      return res.status(401).json({ error: "Invalid credentials or role" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      username: user.username,
      role: user.role,
      token
    });
  } catch (err) {
    console.error("❌ loginUser error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = { registerUser, loginUser };
