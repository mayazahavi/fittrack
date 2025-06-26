document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const mealGroup = document.getElementById("meal-group");
  const addMealBtn = document.getElementById("add-meal-btn");
  const errorField = document.getElementById("form-error");
  const caloriesDisplay = document.getElementById("calories-display");

  const API_KEY = "3fe2bc6af3434976b74f5066ec6c337f";

  // פונקציה ליצירת שדה חדש עם הצעות חכמות
  function createMealInput() {
    const wrapper = document.createElement("div");
    wrapper.className = "meal-wrapper";
    wrapper.innerHTML = `
      <input type="text" class="meal-input" name="meal[]" placeholder="Type a meal..." required />
      <ul class="suggestions-list"></ul>
    `;
    mealGroup.appendChild(wrapper);
  }

  // הוספת אינפוט חדש
  addMealBtn.addEventListener("click", () => {
    createMealInput();
  });

  // טיפול בהשלמה אוטומטית
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

  // שליחת הטופס
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorField.textContent = "";
    caloriesDisplay.textContent = "";

    const inputs = document.querySelectorAll(".meal-input");
    const meals = [...inputs].map(input => input.value.trim()).filter(Boolean);

    if (meals.length === 0) {
      errorField.textContent = "Please enter at least one meal.";
      return;
    }

    let totalCalories = 0;

    try {
      for (const meal of meals) {
        const searchUrl = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(meal)}&apiKey=${API_KEY}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.results && searchData.results.length > 0) {
          const id = searchData.results[0].id;

          const infoUrl = `https://api.spoonacular.com/food/ingredients/${id}/information?amount=1&apiKey=${API_KEY}`;
          const infoRes = await fetch(infoUrl);
          const infoData = await infoRes.json();

          const cal = infoData.nutrition?.nutrients?.find(n => n.name === "Calories");
          if (cal) totalCalories += cal.amount;
        }
      }

      caloriesDisplay.textContent = `Total calories: ${totalCalories.toFixed(0)} kcal`;
    } catch (err) {
      console.error(err);
      errorField.textContent = "Error fetching calorie data. Please try again.";
    }
  });

  // יצירה התחלתית של שדה אחד
  createMealInput();
});
