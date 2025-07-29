const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const connectDB = require("./db");

const userRoutes = require("./routes/userRoutes");
const entryRoutes = require("./routes/entryRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const traineeProfileRoutes = require("./routes/profileRoutes");

const app = express();

// ✅ אימות טוקן
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token or bad format.");
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// 🔧 Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("client"));

// 📦 Routes
app.use("/api/users", userRoutes);
app.use("/api/entries", verifyToken, entryRoutes);
app.use("/api/coach/feedback", verifyToken, feedbackRoutes);

// ✅ כל הראוטים של trainee profile מוגנים בטוקן
app.use("/api/trainee/profile", verifyToken, traineeProfileRoutes);

// 🚀 Start server
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  });
});
