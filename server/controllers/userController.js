const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const validRoles = ["trainee", "coach"];

// ✅ הרשמה
const registerUser = async (req, res) => {
  const { username, password, role, secretCode } = req.body;

  try {
    // 🔒 בדיקה אם חסרים שדות בסיסיים
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // 🧪 בדיקת תפקיד חוקי
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    // 🛡️ בדיקת קוד סודי למאמנים
    if (role === "coach") {
      const expectedSecretCode = "123";

      if (!secretCode) {
        return res.status(403).json({ error: "Secret code is required for coach registration" });
      }

      if (secretCode !== expectedSecretCode) {
        return res.status(403).json({ error: "Invalid secret code for coach registration" });
      }
    }

    // 🧍 בדיקה אם שם המשתמש כבר קיים לאותו תפקיד
    const existingUser = await User.findOne({ username, role });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists for this role" });
    }

    // 🔐 הצפנת סיסמה ושמירה
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ registerUser error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ התחברות
const loginUser = async (req, res) => {
  const { username, password, role } = req.body;
  console.log("Login attempt:", { username, password, role });

  try {
    // 🛡️ בדיקות מקדימות לשדות חובה
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

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
