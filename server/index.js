// 1. קודם כל: טען את dotenv וה־.env לפני כל דבר אחר
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 2. עכשיו שאר הייבוא של קבצים אחרים
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const jwt = require("jsonwebtoken");

const userRoutes = require("./routes/userRoutes");
const entryRoutes = require("./routes/entryRoutes");

const app = express();

// 3. בדיקה שהערכים באמת נטענו
console.log("🔑 Loaded environment variables:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅" : "❌");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅" : "❌");
console.log("SPOONACULAR_API_KEY:", process.env.SPOONACULAR_API_KEY ? "✅" : "❌");

// 4. Middleware עם לוגים לבדיקת טוקן
const verifyTokenWithLogging = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization header received:", authHeader);

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

// 5. Middleware גלובלי
app.use(cors());
app.use(express.json());
app.use(express.static("client"));

// 6. ראוטים
app.use("/api/users", userRoutes);
app.use("/api/entries", verifyTokenWithLogging, entryRoutes);

// 7. הפעלת שרת אחרי חיבור למסד
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  });
});
