document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const feedback = document.getElementById("feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = document.getElementById("date").value;
    const meals = [];
    const mealNames = document.querySelectorAll(".meal-name");
    const mealCalories = document.querySelectorAll(".meal-calories");

    for (let i = 0; i < mealNames.length; i++) {
      const name = mealNames[i].value.trim();
      const calories = parseInt(mealCalories[i].value.trim());
      if (name && !isNaN(calories)) {
        meals.push({ name, calories });
      }
    }

    const workout = document.getElementById("workout").checked;

    const entryData = {
      date,
      meals,
      workout,
    };

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(entryData),
      });

      const data = await response.json();

      if (response.ok) {
        feedback.textContent = "Entry submitted successfully!";
        feedback.style.color = "green";
        form.reset();
      } else {
        feedback.textContent = data.error || "Submission failed.";
        feedback.style.color = "red";
      }
    } catch (error) {
      feedback.textContent = "Error submitting entry.";
      feedback.style.color = "red";
    }
  });

  document.getElementById("addMeal").addEventListener("click", () => {
    const mealsContainer = document.getElementById("mealsContainer");
    const mealDiv = document.createElement("div");
    mealDiv.classList.add("meal-entry");
    mealDiv.innerHTML = `
      <input type="text" class="meal-name" placeholder="Meal name" required />
      <input type="number" class="meal-calories" placeholder="Calories" required />
    `;
    mealsContainer.appendChild(mealDiv);
  });
});
