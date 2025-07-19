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
router.post("/", verifyToken, createEntry);
router.get("/", verifyToken, getEntries);
router.delete("/:id", verifyToken, deleteEntry);
router.put("/:id", verifyToken, updateEntry);

module.exports = router;
