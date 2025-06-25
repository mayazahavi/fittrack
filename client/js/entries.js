// entries.js

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("entriesTable");

  // שלב 1: משיכת הנתונים מהשרת
  fetch("http://localhost:3000/api/entries")
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    })
    .then(entries => {
      tableBody.innerHTML = ""; // לרוקן לפני הוספה
      entries.forEach(entry => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${entry.date}</td>
          <td>${entry.meals.join(", ")}</td>
          <td>${entry.workout || "None"}</td>
          <td>${entry.calories}</td>
          <td>
            <button class="edit-btn" data-id="${entry.id}">✏️</button>
            <button class="delete-btn" data-id="${entry.id}">🗑</button>
          </td>
        `;

        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error("Error loading entries:", error);
      tableBody.innerHTML = "<tr><td colspan='5'>Error loading entries</td></tr>";
    });

  // שלב 2: מחיקה בלחיצה על כפתור
  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;
      fetch(`http://localhost:3000/api/entries/${id}`, {
        method: "DELETE"
      })
        .then(response => {
          if (!response.ok) throw new Error("Failed to delete entry");
          e.target.closest("tr").remove();
        })
        .catch(error => {
          alert("Could not delete entry");
          console.error(error);
        });
    }
  });
});
