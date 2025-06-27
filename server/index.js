require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const entryRoutes = require("./routes/entryRoutes");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});

app.use("/api/entries", entryRoutes);
