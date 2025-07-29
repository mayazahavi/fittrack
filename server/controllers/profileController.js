const Profile = require("../models/Profile");
const User = require("../models/User");

// 📥 קבלת פרופיל מתאמן לפי שם משתמש
exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const profile = await Profile.findOne({ user: user._id });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    res.json({ trainee: profile });
  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 📝 עדכון פרופיל או יצירה אם לא קיים
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { age, gender, height, weight } = req.body;

    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      profile = new Profile({
        user: userId,
        age,
        gender,
        height,
        weightHistory: [{ weight, date: new Date() }],
      });
    } else {
      profile.age = age;
      profile.gender = gender;
      profile.height = height;
      profile.weightHistory.push({ weight, date: new Date() });
    }

    await profile.save();
    res.status(200).json({ message: "Profile saved", profile });
  } catch (err) {
    console.error("Error in updateProfile:", err);
    res.status(500).json({ error: "Failed to save profile" });
  }
};

// ✅ שליפת רשימת מגדרים באופן דינמי
exports.getGenders = (req, res) => {
  try {
    const genders = ["male", "female", "other"];
    res.json(genders);
  } catch (err) {
    console.error("Error in getGenders:", err);
    res.status(500).json({ error: "Failed to fetch gender list" });
  }
};
