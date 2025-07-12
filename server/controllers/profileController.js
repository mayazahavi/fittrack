const TraineeProfile = require("../models/TraineeProfile");

// 🔵 שליפת פרופיל לפי המשתמש המחובר (מהטוקן)
exports.getProfile = async (req, res) => {
  try {
    const username = req.user.username;
    const profile = await TraineeProfile.findOne({ username });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const latestWeight = profile.weightHistory.at(-1)?.weight || null;

    res.json({
      trainee: {
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weightHistory: profile.weightHistory,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// 🔴 עדכון או יצירה של פרופיל
exports.updateProfile = async (req, res) => {
  try {
    const username = req.user.username; // נשלף מהטוקן
    const { age, gender, height, weight } = req.body;

    let profile = await TraineeProfile.findOne({ username });

    if (!profile) {
      profile = new TraineeProfile({
        username,
        age,
        gender,
        height,
        weightHistory: [{ weight }],
      });
    } else {
      profile.age = age;
      profile.gender = gender;
      profile.height = height;
      profile.weightHistory.push({ weight }); // שמירת היסטוריית משקלים
    }

    await profile.save();
    res.status(200).json({ message: "Profile saved successfully" });
  } catch (err) {
    console.error("Error in updateProfile:", err.message);
    res.status(500).json({ error: "Error saving profile" });
  }
};
