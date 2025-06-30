document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#entriesTable tbody");

  try {
    const res = await fetch("/api/entries"); // ✅ שימוש בנתיב יחסי
    const allEntries = await res.json();

    allEntries.forEach(entry => {
      const row = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.textContent = entry.date;
      row.appendChild(dateCell);

      const mealCell = document.createElement("td");
      mealCell.textContent = entry.meals.map(m => m.name).join(", ");
      row.appendChild(mealCell);

      const caloriesCell = document.createElement("td");
      caloriesCell.textContent = entry.meals.reduce((sum, m) => sum + Number(m.calories), 0);
      row.appendChild(caloriesCell);

      const actionsCell = document.createElement("td");

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = async () => {
        await fetch(`/api/entries/${entry._id}`, {
          method: "DELETE" // ✅ שימוש בנתיב יחסי
        });
        row.remove();
      };
      actionsCell.appendChild(deleteBtn);

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.onclick = async () => {
        const newMeal = prompt("Enter new meal name:");
        const newCalories = prompt("Enter new calorie amount:");
        if (newMeal && newCalories) {
          await fetch(`/api/entries/${entry._id}`, {
            method: "PUT", // ✅ שימוש בנתיב יחסי
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              meals: [{ name: newMeal, calories: Number(newCalories) }]
            })
          });
          location.reload();
        }
      };
      actionsCell.appendChild(editBtn);

      row.appendChild(actionsCell);
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to fetch entries:", err);
  }
});
