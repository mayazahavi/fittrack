const express = require("express");
const router = express.Router();
const axios = require("axios");

const verifyToken = require("../middleware/auth");
const {
  createEntry,
  getEntries,
  deleteEntry,
  updateEntry
} = require("../controllers/entryController");

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// 🔍 חיפוש רכיב לפי שם (אוטוקומפליט)
router.get("/ingredients/search", verifyToken, async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }
  try {
    const url = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(query)}&apiKey=${SPOONACULAR_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching from Spoonacular:", err.message);
    res.status(500).json({ error: "Failed to fetch ingredient data" });
  }
});

// ✅ ראוט חדש – פרטי רכיב לפי ID (כולל possibleUnits)
router.get("/ingredients/:id/information", verifyToken, async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "Missing ingredient ID" });
  }
  try {
    const url = `https://api.spoonacular.com/food/ingredients/${id}/information?amount=1&apiKey=${SPOONACULAR_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data); // מכיל גם possibleUnits
  } catch (err) {
    console.error("Error fetching ingredient info:", err.message);
    res.status(500).json({ error: "Failed to fetch ingredient information" });
  }
});

// ✅ החזרת סוגי אימון
router.get("/workouts", verifyToken, (req, res) => {
  const workouts = [
    { value: "running", label: "Running" },
    { value: "yoga", label: "Yoga" },
    { value: "strength", label: "Strength Training" },
    { value: "none", label: "No workout today" },
  ];
  res.json(workouts);
});

router.post("/", verifyToken, createEntry);
router.get("/", verifyToken, getEntries);
router.delete("/:id", verifyToken, deleteEntry);
router.put("/:id", verifyToken, updateEntry);

module.exports = router;
