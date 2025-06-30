const express = require("express");
const router = express.Router();

const {
  createEntry,
  getEntries,
  deleteEntry,
  updateEntry
} = require("../controllers/entryController");

const verifyToken = require("../middleware/auth"); // ✅ חובה

// ✅ כל פעולה דורשת התחברות
router.post("/", verifyToken, createEntry);
router.get("/", verifyToken, getEntries);
router.delete("/:id", verifyToken, deleteEntry);
router.put("/:id", verifyToken, updateEntry);

module.exports = router;
