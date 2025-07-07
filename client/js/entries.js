import { BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("entriesTable");
  const editModal = document.getElementById("editModal");
  const editForm = document.getElementById("editForm");
  const editTime = document.getElementById("editTime");
  const editWorkout = document.getElementById("editWorkout");
  const editMealGroup = document.getElementById("editMealGroup");
  const addEditMealBtn = document.getElementById("addEditMealBtn");

  let currentEditId = null;
  const token = localStorage.getItem("token");

  if (!token) {
    tableBody.innerHTML = "<tr><td colspan='6'>You must be logged in.</td></tr>";
    return;
  }

  function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  }

  const userId = parseJwt(token).id;

  function createMealInput(name = "") {
    const wrapper = document.createElement("div");
    wrapper.className = "meal-wrapper";
    wrapper.style.position = "relative";
    wrapper.innerHTML = `
      <input type="text" class="meal-input" value="${name}" required />
      <ul class="suggestions-list"></ul>
    `;
    const input = wrapper.querySelector(".meal-input");
    const suggestions = wrapper.querySelector(".suggestions-list");

    input.addEventListener("input", async () => {
      const query = input.value.trim();
      suggestions.innerHTML = "";
      if (query.length < 2) return;

      try {
        const res = await fetch(`${BASE_URL}/api/entries/ingredients/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        data.results.slice(0, 5).forEach(item => {
          const li = document.createElement("li");
          li.textContent = item.name;
          li.onclick = () => {
            input.value = item.name;
            suggestions.innerHTML = "";
          };
          suggestions.appendChild(li);
        });
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    });

    editMealGroup.appendChild(wrapper);
  }

  addEditMealBtn.addEventListener("click", () => {
    createMealInput();
  });

  async function loadEntries() {
    try {
      const res = await fetch(`${BASE_URL}/api/entries?traineeId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allEntries = await res.json();
      tableBody.innerHTML = "";

      if (allEntries.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='6'>No entries found.</td></tr>";
        return;
      }

      allEntries.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

      allEntries.forEach(entry => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${entry.date}</td>
          <td>${entry.time || "—"}</td>
          <td>${entry.meals?.map(m => `${m.name} (${m.calories?.toFixed(0) || "0"} kcal)`).join("<br>") || "—"}</td>
          <td>${entry.workout || "—"}</td>
          <td>${entry.calories?.toFixed(0) || 0} kcal</td>
          <td></td>
        `;

        const actionsCell = row.querySelector("td:last-child");

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "🗑 Delete";
        deleteBtn.onclick = async () => {
          if (confirm("Are you sure you want to delete this entry?")) {
            await fetch(`${BASE_URL}/api/entries/${entry._id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
            });
            await loadEntries();
          }
        };

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "✏️ Edit";
        editBtn.onclick = () => {
          currentEditId = entry._id;
          editTime.value = entry.time || "";
          editWorkout.value = entry.workout || "";
          editMealGroup.innerHTML = "";
          (entry.meals || []).forEach(meal => {
            createMealInput(meal.name);
          });
          editModal.showModal();
        };

        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);

        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error("Error loading entries:", err);
      tableBody.innerHTML = "<tr><td colspan='6'>Error loading entries.</td></tr>";
    }
  }

  await loadEntries();

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditId) return;

    const meals = Array.from(editMealGroup.querySelectorAll(".meal-input"))
      .map(input => ({ name: input.value.trim() }))
      .filter(m => m.name);

    const updatedData = {
      meals,
      time: editTime.value,
      workout: editWorkout.value.trim()
    };

    try {
      const response = await fetch(`${BASE_URL}/api/entries/${currentEditId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error("Failed to update entry");

      editModal.close();
      await loadEntries();
    } catch (err) {
      alert("Error updating entry: " + err.message);
    }
  });
});
