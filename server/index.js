// server/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");

const userRoutes = require("./routes/userRoutes");
const entryRoutes = require("./routes/entryRoutes");

dotenv.config(); // טען משתני סביבה מהקובץ .env

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/entries", entryRoutes);

// Connect to DB and start server
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
