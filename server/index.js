// 1. קודם כל: טען את dotenv וה־.env לפני כל דבר אחר
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 2. עכשיו שאר הייבוא של קבצים אחרים
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const userRoutes = require("./routes/userRoutes");
const entryRoutes = require("./routes/entryRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes"); // ראוט לפידבקים

const app = express();

// 3. בדיקה שהערכים באמת נטענו
console.log("🔑 Loaded environment variables:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅" : "❌");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅" : "❌");
console.log("SPOONACULAR_API_KEY:", process.env.SPOONACULAR_API_KEY ? "✅" : "❌");

// 4. Middleware גלובלי
app.use(cors());
app.use(express.json());
app.use(express.static("client"));

// 5. ראוטים
app.use("/api/users", userRoutes);
app.use("/api/entries", entryRoutes); // ב-entryRoutes כן אפשר להשאיר אימות אם יש בפנים
app.use("/api/coach/feedback", feedbackRoutes); // כאן אין אימות חיצוני – הוא נעשה בתוך הקובץ עצמו

// 6. הפעלת שרת אחרי חיבור למסד
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  });
});
