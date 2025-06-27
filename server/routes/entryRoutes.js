const express = require("express");
const router = express.Router();
const controller = require("../controllers/entryController");

router.get("/", controller.getEntries);
router.post("/", controller.createEntry);
router.delete("/:id", controller.deleteEntry);
router.put("/:id", controller.updateEntry);

module.exports = router;
