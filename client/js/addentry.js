document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const mealGroup = document.getElementById("meal-group");
  const addMealBtn = document.getElementById("add-meal-btn");
  const errorField = document.getElementById("form-error");
  const caloriesDisplay = document.getElementById("calories-display");

  const API_KEY = "3fe2bc6af3434976b74f5066ec6c337f"; // ← מפתח Spoonacular

  function createMealInput() {
    const wrapper = document.createElement("div");
    wrapper.className = "meal-wrapper";
    wrapper.innerHTML = `
      <input type="text" class="meal-input" name="meal[]" placeholder="Type a meal..." required />
      <ul class="suggestions-list"></ul>
    `;
    mealGroup.appendChild(wrapper);
  }

  addMealBtn.addEventListener("click", () => {
    createMealInput();
  });

  // השלמה אוטומטית
  mealGroup.addEventListener("input", async (e) => {
    if (e.target.classList.contains("meal-input")) {
      const input = e.target;
      const list = input.nextElementSibling;
      const query = input.value.trim();

      if (query.length < 2) {
        list.innerHTML = "";
        return;
      }

      const url = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(query)}&apiKey=${API_KEY}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        list.innerHTML = "";

        if (data.results) {
          data.results.slice(0, 5).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.name;
            li.addEventListener("click", () => {
              input.value = item.name;
              list.innerHTML = "";
            });
            list.appendChild(li);
          });
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorField.textContent = "";
    caloriesDisplay.innerHTML = "";

    const inputs = document.querySelectorAll(".meal-input");
    const mealNames = [...inputs].map(input => input.value.trim()).filter(Boolean);
    const workout = document.getElementById("workout").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (mealNames.length === 0 || !workout || !date || !time) {
      errorField.textContent = "Please fill in all fields.";
      return;
    }

    let totalCalories = 0;
    const caloriesPerMeal = [];

    try {
      for (const name of mealNames) {
        const searchUrl = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(name)}&apiKey=${API_KEY}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.results && searchData.results.length > 0) {
          const id = searchData.results[0].id;
          const infoUrl = `https://api.spoonacular.com/food/ingredients/${id}/information?amount=1&apiKey=${API_KEY}`;
          const infoRes = await fetch(infoUrl);
          const infoData = await infoRes.json();

          const cal = infoData.nutrition?.nutrients?.find(n => n.name === "Calories");
          if (cal) {
            caloriesPerMeal.push({ name, calories: cal.amount });
            totalCalories += cal.amount;
          }
        }
      }

      const breakdown = caloriesPerMeal
        .map(item => `${item.name} – ${item.calories.toFixed(0)} kcal`)
        .join("<br>");
      caloriesDisplay.innerHTML = breakdown + `<br><strong>Total: ${totalCalories.toFixed(0)} kcal</strong>`;

      const entryData = {
        meals: caloriesPerMeal,
        calories: totalCalories,
        caloriesPerMeal,
        workout,
        date,
        time
      };

      const token = localStorage.getItem("token");

      // ⬇️ שימוש ב־location.origin במקום localhost
      const response = await fetch(`${location.origin}/api/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(entryData)
      });

      if (response.ok) {
        alert("✅ Entry saved successfully!");
        form.reset();
        mealGroup.innerHTML = "";
        createMealInput();
        caloriesDisplay.textContent = "";
      } else {
        errorField.textContent = "❌ Failed to save entry to server.";
      }
    } catch (err) {
      console.error(err);
      errorField.textContent = "❌ Error processing request. Please try again.";
    }
  });

  createMealInput();
});
