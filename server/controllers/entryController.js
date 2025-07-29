const Entry = require("../models/Entry");
const axios = require("axios");
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// פונקציה חדשה שמחשבת קלוריות לפי שם, כמות ויחידה
async function getCaloriesFromAPI(mealName, amount, unit) {
  const searchUrl = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(mealName)}&apiKey=${SPOONACULAR_API_KEY}`;
  const searchRes = await axios.get(searchUrl);
  const results = searchRes.data.results;

  if (!results || results.length === 0) {
    throw new Error(`❌ Ingredient "${mealName}" not found`);
  }

  const id = results[0].id;
  const infoUrl = `https://api.spoonacular.com/food/ingredients/${id}/information?amount=${amount}&unit=${unit}&apiKey=${SPOONACULAR_API_KEY}`;
  const infoRes = await axios.get(infoUrl);
  const nutrients = infoRes.data.nutrition?.nutrients;
  const calObj = nutrients?.find(n => n.name === "Calories");

  if (!calObj) {
    throw new Error(`❌ No calorie data available for "${mealName}"`);
  }

  return calObj.amount;
}

exports.createEntry = async (req, res) => {
  try {
    const { meals, workout, date, time } = req.body;
    if (!Array.isArray(meals) || meals.some(m => !m.name || !m.amount || !m.unit)) {
      return res.status(400).json({ error: "Invalid meal format" });
    }

    const mealsWithCalories = [];
    let totalCalories = 0;

    for (const meal of meals) {
      try {
        const calories = await getCaloriesFromAPI(meal.name, meal.amount, meal.unit);
        mealsWithCalories.push({
          name: meal.name,
          amount: meal.amount,
          unit: meal.unit,
          calories
        });
        totalCalories += calories;
      } catch (err) {
        console.error(`🔴 Failed to get calories for ${meal.name}:`, err.message);
        return res.status(400).json({
          error: `Meal "${meal.name}" has no calorie data. Please choose another.`
        });
      }
    }

    const newEntry = new Entry({
      meals: mealsWithCalories,
      calories: totalCalories,
      workout,
      date,
      time,
      user: req.user.id
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    console.error("❌ Error saving entry:", err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.getEntries = async (req, res) => {
  try {
    const { traineeId, date } = req.query;

    if (!traineeId) {
      return res.status(400).json({ error: "Missing traineeId parameter" });
    }

    const query = { user: traineeId };
    if (date) {
      query.date = date;
    }

    const entries = await Entry.find(query).sort({ date: -1, time: -1 });
    res.status(200).json(entries);
  } catch (err) {
    console.error("❌ Error fetching entries:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting entry:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const { meals, workout, time } = req.body;

    if (!meals || !Array.isArray(meals)) {
      return res.status(400).json({ error: "Meals must be provided as an array" });
    }

    let updatedMeals = [];
    let totalCalories = 0;

    for (const meal of meals) {
      try {
        const calories = await getCaloriesFromAPI(meal.name, meal.amount, meal.unit);
        updatedMeals.push({
          name: meal.name,
          amount: meal.amount,
          unit: meal.unit,
          calories
        });
        totalCalories += calories;
      } catch (err) {
        console.error(`🔴 Failed to get calories for ${meal.name}:`, err.message);
        return res.status(400).json({
          error: `Meal "${meal.name}" has no calorie data. Please choose another.`
        });
      }
    }

    const updatedEntry = await Entry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        meals: updatedMeals,
        calories: totalCalories,
        workout,
        time
      },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json(updatedEntry);
  } catch (err) {
    console.error("❌ Error updating entry:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
