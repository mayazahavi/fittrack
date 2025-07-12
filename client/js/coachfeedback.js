import { BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const traineeSelect = document.getElementById("traineeSelect");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const traineeDataContent = document.getElementById("traineeDataModalContent");
  const coachForm = document.getElementById("coachForm");
  const showDataBtn = document.getElementById("showTraineeDataBtn");
  const formStatus = document.getElementById("form-status-message");

  function getTodayDateISO() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  async function loadTrainees() {
    try {
      const res = await fetch(`${BASE_URL}/api/users/trainees`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!res.ok) throw new Error("Failed to load trainees");
      const trainees = await res.json();
      trainees.forEach(t => {
        const option = document.createElement("option");
        option.value = t._id;
        option.textContent = t.username;
        traineeSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error loading trainees:", err);
      alert("Error loading trainees: " + err.message);
    }
  }

  async function loadTraineeData() {
    const traineeId = traineeSelect.value;
    if (!traineeId) {
      traineeDataContent.innerHTML = "Please select a trainee.";
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/entries?traineeId=${traineeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!res.ok) throw new Error("Failed to load trainee data");
      let data = await res.json();

      if (!data.length) {
        traineeDataContent.innerHTML = "No data found for this trainee.";
        return;
      }

      data.sort((a, b) => new Date(b.date + "T" + (b.time || "00:00")) - new Date(a.date + "T" + (a.time || "00:00")));

      traineeDataContent.innerHTML = data.map(entry => `
        <div style="border-bottom: 1px solid #ccc; padding: 5px 0; margin-bottom: 5px;">
          <strong>Date:</strong> ${entry.date}<br/>
          <strong>Time:</strong> ${entry.time || "Unknown"}<br/>
          <strong>Meals:</strong> ${entry.meals.map(m => m.name).join(", ")}<br/>
          <strong>Calories:</strong> ${entry.calories || 0} kcal<br/>
          <strong>Exercise:</strong> ${entry.workout || "No data"}
        </div>
      `).join("");
    } catch (err) {
      traineeDataContent.innerHTML = "Error loading data.";
      console.error("Error loading trainee data:", err);
    }
  }

  loadTrainees();

  traineeSelect.addEventListener("change", () => {
    loadTraineeData();
  });

  showDataBtn.addEventListener("click", () => {
    if (!traineeSelect.value) {
      alert("Please select a trainee first.");
      return;
    }
    dateInput.value = getTodayDateISO();
    loadTraineeData();
  });

  coachForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formStatus.innerHTML = "";
    formStatus.className = "text-center fw-bold mt-3 form-status-box";

    coachForm.classList.add("was-validated");

    if (!coachForm.checkValidity()) {
      formStatus.innerHTML = `<i class="bi bi-x-circle-fill"></i> Please complete all required fields.`;
      formStatus.classList.add("text-danger");
      return;
    }

    const payload = {
      traineeId: traineeSelect.value,
      datetime: `${dateInput.value}T${timeInput.value}`,
      tips: {
        nutrition: document.getElementById("tipNutrition").value.trim(),
        exercise: document.getElementById("tipExercise").value.trim(),
        general: document.getElementById("tipGeneral").value.trim()
      }
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/coach/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to send feedback");

      formStatus.innerHTML = `<i class="bi bi-check-circle-fill"></i> Feedback sent successfully!`;
      formStatus.className = "text-center fw-bold mt-3 form-status-box text-success";

      coachForm.reset();
      coachForm.classList.remove("was-validated");
      traineeDataContent.innerHTML = "Please select a trainee.";

      setTimeout(() => {
        formStatus.innerHTML = "";
        formStatus.className = "text-center fw-bold mt-3 form-status-box";
      }, 5000);
    } catch (err) {
      formStatus.innerHTML = `<i class="bi bi-x-circle-fill"></i> Error sending feedback: ${err.message}`;
      formStatus.className = "text-center fw-bold mt-3 form-status-box text-danger";

      setTimeout(() => {
        formStatus.innerHTML = "";
        formStatus.className = "text-center fw-bold mt-3 form-status-box";
      }, 5000);

      console.error("Feedback submission error:", err);
    }
  });
});
