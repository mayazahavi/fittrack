document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#entriesTable tbody");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Unauthorized. Please log in.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/entries", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const entries = await res.json();

    entries.forEach(entry => {
      const row = document.createElement("tr");

      const mealsText = entry.caloriesPerMeal
        .map(meal => meal.name)
        .join(", ");

      row.innerHTML = `
        <td>${mealsText}</td>
        <td>${entry.calories}</td>
        <td>${entry.workout}</td>
        <td>${entry.date}</td>
        <td>${entry.time}</td>
        <td>
          <button class="edit-btn" data-id="${entry._id}">Edit</button>
          <button class="delete-btn" data-id="${entry._id}">Delete</button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    // מחיקה
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        if (confirm("Are you sure you want to delete this entry?")) {
          await fetch(`http://localhost:3000/api/entries/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          location.reload();
        }
      });
    });

    // עריכה
    document.querySelectorAll(".edit-btn").forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        const newWorkout = prompt("Enter new workout:");
        const newDate = prompt("Enter new date (YYYY-MM-DD):");
        const newTime = prompt("Enter new time (HH:MM):");

        if (newWorkout && newDate && newTime) {
          await fetch(`http://localhost:3000/api/entries/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              workout: newWorkout,
              date: newDate,
              time: newTime
              // את יכולה להוסיף גם meals או calories אם רוצים לעדכן אותם
            })
          });
          location.reload();
        }
      });
    });

  } catch (err) {
    console.error("❌ Failed to load entries:", err);
  }
});
