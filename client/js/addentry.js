import { BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const mealGroup = document.getElementById("meal-group");
  const addMealBtn = document.getElementById("add-meal-btn");
  const errorField = document.getElementById("form-error");
  const caloriesDisplay = document.getElementById("calories-display");

  // אלמנטים לשגיאות לפי שדה
  const mealError = document.getElementById("meal-error");
  const workoutError = document.getElementById("workout-error");
  const dateError = document.getElementById("date-error");
  const timeError = document.getElementById("time-error");

  function clearFieldErrors() {
    mealError.textContent = "";
    workoutError.textContent = "";
    dateError.textContent = "";
    timeError.textContent = "";
    errorField.textContent = "";
  }

  function createMealInput() {
    const wrapper = document.createElement("div");
    wrapper.className = "meal-wrapper";
    wrapper.innerHTML = `
      <input type="text" class="meal-input form-control mb-2" name="meal[]" placeholder="Type a meal..." required />
      <ul class="suggestions-list"></ul>
    `;
    mealGroup.appendChild(wrapper);
  }

  addMealBtn.addEventListener("click", () => {
    createMealInput();
  });

  // השלמה אוטומטית עם Authorization header
  mealGroup.addEventListener("input", async (e) => {
    if (e.target.classList.contains("meal-input")) {
      const input = e.target;
      const list = input.nextElementSibling;
      const query = input.value.trim();

      if (query.length < 2) {
        list.innerHTML = "";
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/entries/ingredients/search?query=${encodeURIComponent(query)}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to fetch ingredient suggestions");

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
    clearFieldErrors();
    caloriesDisplay.innerHTML = "";

    const inputs = document.querySelectorAll(".meal-input");

    const meals = [...inputs]
      .map(input => input.value.trim())
      .filter(Boolean)
      .map(name => ({ name }));

    const workout = document.getElementById("workout").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    let hasError = false;

    // ✳️ בדיקות שגיאה ספציפיות לכל שדה
    if (meals.length === 0) {
      mealError.textContent = "Please enter at least one meal.";
      hasError = true;
    }

    if (!workout) {
      workoutError.textContent = "Please select a workout.";
      hasError = true;
    }

    if (!date) {
      dateError.textContent = "Please choose a date.";
      hasError = true;
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (date !== today) {
        dateError.textContent = "Date must be today's date.";
        hasError = true;
      }
    }

    if (!time) {
      timeError.textContent = "Please enter a time.";
      hasError = true;
    }

    if (hasError) return;

    try {
      const entryData = { meals, workout, date, time };
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(entryData)
      });

      const result = await response.json();

      if (response.ok) {
        if (result.meals.length === 0) {
          errorField.textContent = "❌ No calorie data available for the selected meals. Try different foods.";
          return;
        }

        alert("✅ Entry saved successfully!");
        form.reset();
        mealGroup.innerHTML = "";
        createMealInput();
        caloriesDisplay.textContent = "";
      } else {
        errorField.textContent = `❌ Failed to save entry: ${result.error || 'Unknown error'}`;
      }
    } catch (err) {
      console.error(err);
      errorField.textContent = "❌ Error processing request. Please try again.";
    }
  });

  createMealInput();
});
