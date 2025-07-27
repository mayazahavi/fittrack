import { BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const mealGroup = document.getElementById("meal-group");
  const addMealBtn = document.getElementById("add-meal-btn");
  const caloriesDisplay = document.getElementById("calories-display");
  const feedbackMsg = document.getElementById("form-feedback");

  const mealError = document.getElementById("meal-error");
  const workoutError = document.getElementById("workout-error");
  const dateError = document.getElementById("date-error");
  const timeError = document.getElementById("time-error");

  function clearFieldErrors() {
    mealError.textContent = "";
    workoutError.textContent = "";
    dateError.textContent = "";
    timeError.textContent = "";

    document.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));

    feedbackMsg.textContent = "";
    feedbackMsg.className = "feedback-msg";
  }

  function showFeedback(message, type) {
    feedbackMsg.textContent = message;
    feedbackMsg.className = `feedback-msg ${type === "error" ? "feedback-error" : "feedback-success"}`;
    feedbackMsg.style.display = "block";

    setTimeout(() => {
      feedbackMsg.textContent = "";
      feedbackMsg.style.display = "none";
    }, 5000);
  }

  function createMealInput() {
    const wrapper = document.createElement("div");
    wrapper.className = "meal-wrapper position-relative mb-2 d-flex align-items-center gap-2";

    wrapper.innerHTML = `
      <input type="text" class="meal-input form-control" name="meal[]" placeholder="Type a meal..." required />
      <ul class="suggestions-list"></ul>
      <button type="button" class="btn-close remove-meal-btn" aria-label="Remove"></button>
    `;

    mealGroup.appendChild(wrapper);

    const removeBtn = wrapper.querySelector(".remove-meal-btn");
    removeBtn.addEventListener("click", () => {
      wrapper.remove();
    });
  }

  async function populateWorkoutOptions() {
    const select = document.getElementById("workout");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/entries/workouts`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch workout options");

      const workouts = await response.json();
      workouts.forEach(w => {
        const option = document.createElement("option");
        option.value = w.value;
        option.textContent = w.label;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("❌ Failed to load workout options:", err);
      const errorOption = document.createElement("option");
      errorOption.value = "";
      errorOption.textContent = "Error loading workouts";
      errorOption.disabled = true;
      select.appendChild(errorOption);
    }
  }

  addMealBtn.addEventListener("click", () => {
    createMealInput();
  });

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

        if (!res.ok) throw new Error("Failed to fetch suggestions");
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
    caloriesDisplay.textContent = "";

    const inputs = document.querySelectorAll(".meal-input");
    const workoutSelect = document.getElementById("workout");
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");

    const date = dateInput.value;
    const time = timeInput.value;
    const workout = workoutSelect.value.trim();

    let hasError = false;

    const mealValues = [...inputs].map(input => input.value.trim());
    const filledMeals = mealValues.filter(Boolean);

    if (filledMeals.length === 0) {
      mealError.textContent = "❌ At least one meal is required.";
      inputs.forEach(input => input.classList.add("is-invalid"));
      hasError = true;
    } else {
      inputs.forEach((input, index) => {
        if (!mealValues[index]) {
          input.classList.add("is-invalid");
        } else {
          input.classList.remove("is-invalid");
        }
      });
    }

    if (!workout) {
      workoutError.textContent = "❌ Please select a workout.";
      workoutSelect.classList.add("is-invalid");
      hasError = true;
    } else {
      workoutSelect.classList.remove("is-invalid");
    }

    if (!date) {
      dateError.textContent = "❌ Date is required.";
      dateInput.classList.add("is-invalid");
      hasError = true;
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (date !== today) {
        dateError.textContent = "❌ Date must be today.";
        dateInput.classList.add("is-invalid");
        hasError = true;
      } else {
        dateInput.classList.remove("is-invalid");
      }
    }

    if (!time) {
      timeError.textContent = "❌ Time is required.";
      timeInput.classList.add("is-invalid");
      hasError = true;
    } else {
      timeInput.classList.remove("is-invalid");
    }

    if (hasError) return;

    try {
      const meals = filledMeals.map(name => ({ name }));
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
        if (!result.meals || result.meals.length === 0) {
          showFeedback("❌ No nutritional data found. Try different meals.", "error");
          return;
        }

        showFeedback("✅ Entry saved successfully!", "success");

        form.reset();
        mealGroup.innerHTML = "";
        createMealInput();
        caloriesDisplay.textContent = "";

      } else {
        showFeedback(`❌ Failed to save entry: ${result.error || 'Unknown error'}`, "error");
      }
    } catch (err) {
      console.error(err);
      showFeedback("❌ Error submitting the form. Please try again.", "error");
    }
  });

  createMealInput();
  populateWorkoutOptions(); // <-- טעינה דינמית של סוגי האימון
});
