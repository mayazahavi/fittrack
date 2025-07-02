document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const mealGroup = document.getElementById("meal-group");
  const addMealBtn = document.getElementById("add-meal-btn");
  const errorField = document.getElementById("form-error");
  const caloriesDisplay = document.getElementById("calories-display");

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

  // השלמה אוטומטית – עם Authorization header
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
        const res = await fetch(`/api/entries/ingredients/search?query=${encodeURIComponent(query)}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch ingredient suggestions");
        }

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

    const meals = [...inputs]
      .map(input => input.value.trim())
      .filter(Boolean)
      .map(name => ({ name }));

    const workout = document.getElementById("workout").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (meals.length === 0 || !workout || !date || !time) {
      errorField.textContent = "Please fill in all fields.";
      return;
    }

    try {
      const entryData = { meals, workout, date, time };
      const token = localStorage.getItem("token");

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
        const errData = await response.json();
        errorField.textContent = `❌ Failed to save entry: ${errData.error || 'Unknown error'}`;
      }
    } catch (err) {
      console.error(err);
      errorField.textContent = "❌ Error processing request. Please try again.";
    }
  });

  // ← היה חסר:
  createMealInput();
});
