const Entry = require("../models/Entry");

exports.createEntry = async (req, res) => {
  try {
    const newEntry = new Entry(req.body);
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEntries = async (req, res) => {
  try {
    const entries = await Entry.find();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    await Entry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const updated = await Entry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
