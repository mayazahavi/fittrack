import { BASE_URL } from "./config.js";

const sportsOptions = [
  "Running", "Cycling", "Yoga", "Swimming", "Weightlifting",
  "Walking", "Pilates", "Dancing", "HIIT", "Crossfit"
];

document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("entriesTable");
  const editModal = document.getElementById("editModal");
  const editForm = document.getElementById("editForm");
  const editTime = document.getElementById("editTime");
  const editWorkout = document.getElementById("editWorkout");
  const editMealGroup = document.getElementById("editMealGroup");
  const addEditMealBtn = document.getElementById("addEditMealBtn");

  const deleteConfirmModal = document.getElementById("deleteConfirmModal");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  let currentDeleteId = null;
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

  function formatDateDMY(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  function createMealInput(name = "") {
    const wrapper = document.createElement("div");
    wrapper.className = "meal-wrapper";
    wrapper.innerHTML = `
      <div class="meal-input-group">
        <input type="text" class="meal-input form-control" value="${name}" />
        <button type="button" class="remove-meal-btn" title="Remove">×</button>
        <ul class="suggestions-list"></ul>
        <div class="meal-error text-danger small mt-1" style="display: none;">Please enter a meal name</div>
      </div>
    `;

    const input = wrapper.querySelector(".meal-input");
    const removeBtn = wrapper.querySelector(".remove-meal-btn");
    const suggestions = wrapper.querySelector(".suggestions-list");

    removeBtn.addEventListener("click", () => wrapper.remove());

    input.addEventListener("input", async () => {
      suggestions.innerHTML = "";
      const query = input.value.trim();
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
  
  editWorkout.addEventListener("input", () => {
    const datalist = document.getElementById("workoutOptions") || document.createElement("datalist");
    datalist.id = "workoutOptions";
    if (!editWorkout.getAttribute("list")) {
      editWorkout.setAttribute("list", "workoutOptions");
      document.body.appendChild(datalist);
    }
    datalist.innerHTML = "";
    sportsOptions.forEach(option => {
      if (option.toLowerCase().includes(editWorkout.value.toLowerCase())) {
        const opt = document.createElement("option");
        opt.value = option;
        datalist.appendChild(opt);
      }
    });
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
          <td>${formatDateDMY(entry.date)}</td>
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
        deleteBtn.onclick = () => {
          currentDeleteId = entry._id;
          deleteConfirmModal.showModal();
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

  confirmDeleteBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!currentDeleteId) return;

    const form = document.getElementById("deleteConfirmForm");
    const message = document.createElement("div");
    message.className = "mt-3 fw-bold text-center";

    try {
      const res = await fetch(`${BASE_URL}/api/entries/${currentDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();

      message.textContent = "Entry deleted successfully.";
      message.style.color = "green";
      await loadEntries();
    } catch {
      message.textContent = "Failed to delete entry.";
      message.style.color = "red";
    }

    form.appendChild(message);

    setTimeout(() => {
      deleteConfirmModal.close();
      message.remove();
    }, 2000);
  });

  await loadEntries();

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditId) return;

    editForm.querySelectorAll(".meal-error").forEach(e => e.style.display = "none");
    editForm.querySelectorAll(".meal-list-error").forEach(e => e.remove());
    editForm.querySelectorAll(".form-feedback").forEach(e => e.remove());
    editTime.classList.remove("is-invalid");
    editWorkout.classList.remove("is-invalid");
    document.querySelectorAll(".time-error, .workout-error").forEach(e => e.remove());

    let isValid = true;

    if (!editTime.value) {
      editTime.classList.add("is-invalid");
      const msg = document.createElement("div");
      msg.className = "invalid-feedback time-error";
      msg.textContent = "Please enter a valid time.";
      editTime.after(msg);
      isValid = false;
    }

    if (!editWorkout.value.trim()) {
      editWorkout.classList.add("is-invalid");
      const msg = document.createElement("div");
      msg.className = "invalid-feedback workout-error";
      msg.textContent = "Please enter a workout.";
      editWorkout.after(msg);
      isValid = false;
    }

    const mealGroups = editMealGroup.querySelectorAll(".meal-input-group");
    if (mealGroups.length === 0) {
      const msg = document.createElement("div");
      msg.className = "meal-list-error text-danger fw-bold mt-2";
      msg.textContent = "Please add at least one meal.";
      editMealGroup.appendChild(msg);
      isValid = false;
    }

    const meals = Array.from(mealGroups).map(group => {
      const input = group.querySelector(".meal-input");
      const error = group.querySelector(".meal-error");
      const value = input.value.trim();
      if (!value) {
        error.style.display = "block";
        isValid = false;
      }
      return { name: value };
    }).filter(m => m.name);

    if (!isValid) return;

    const updatedData = {
      meals,
      time: editTime.value,
      workout: editWorkout.value.trim()
    };

    const feedback = document.createElement("div");
    feedback.className = "form-feedback mt-3 text-center fw-bold";

    try {
      const response = await fetch(`${BASE_URL}/api/entries/${currentEditId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error();

      feedback.textContent = "Changes saved successfully.";
      feedback.classList.add("success");
      await loadEntries();
    } catch {
      feedback.textContent = "Failed to save changes.";
      feedback.classList.add("error");
    }

   const btnSection = editForm.querySelector(".button-row");

    btnSection.insertAdjacentElement("beforebegin", feedback);

    setTimeout(() => {
      feedback.remove();
      editModal.close();
    }, 2000);
  });
});