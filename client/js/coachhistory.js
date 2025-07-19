import { BASE_URL } from './config.js';
document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('feedbackTableBody');
  const modal = document.getElementById("editModal");
  const closeModalBtn = document.getElementById("closeEditModal");
  const editForm = document.getElementById("editFeedbackForm");
  const toast = document.getElementById("toast");

  const deleteModal = document.getElementById("deleteConfirmModal");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const deleteMessageBox = document.getElementById("deleteMessageBox");

  const editDate = document.getElementById("editDate");
  const editTime = document.getElementById("editTime");
  const editNutrition = document.getElementById("editNutrition");
  const editExercise = document.getElementById("editExercise");
  const editGeneral = document.getElementById("editGeneral");

  let currentFeedbackId = null;
  let feedbackRowToDelete = null;

  async function loadFeedbacks() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Please login to view feedback history.</td></tr>';
        return;
      }

      const res = await fetch(`${BASE_URL}/api/coach/feedback`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        const errText = await res.text();
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Error loading feedback: ${errText}</td></tr>`;
        return;
      }

      const feedbacks = await res.json();
      if (!feedbacks.length) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No feedback history available.</td></tr>';
        return;
      }

      tableBody.innerHTML = '';

      feedbacks.forEach(fb => {
        const dateObj = new Date(fb.datetime);
        const dateStr = dateObj.toLocaleDateString('en-GB');
        const timeStr = dateObj.toTimeString().slice(0, 5);
        const traineeName = fb.trainee?.username || fb.trainee || 'Unknown';

        const tipsText =
          `Nutrition: ${fb.tips?.nutrition || "No feedback"}\n` +
          `Exercise: ${fb.tips?.exercise || "No feedback"}\n` +
          `General: ${fb.tips?.general || "No feedback"}`;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${traineeName}</td>
          <td>${dateStr}</td>
          <td>${timeStr}</td>
          <td><pre>${tipsText}</pre></td>
          <td class="actions">
            <button class="edit-btn btn btn-outline-primary btn-sm" data-id="${fb._id}">✏️ Edit</button>
            <button class="delete-btn btn btn-outline-danger btn-sm" data-id="${fb._id}">🗑️ Delete</button>
          </td>
        `;
        tableBody.appendChild(row);

        row.querySelector(".edit-btn").addEventListener("click", () => {
          currentFeedbackId = fb._id;
          editDate.value = dateObj.toISOString().split("T")[0];
          editTime.value = timeStr;
          editNutrition.value = fb.tips?.nutrition || "";
          editExercise.value = fb.tips?.exercise || "";
          editGeneral.value = fb.tips?.general || "";
          clearFormFeedback();
          modal.showModal();
        });

        row.querySelector(".delete-btn").addEventListener("click", () => {
          currentFeedbackId = fb._id;
          feedbackRowToDelete = row;
          clearDeleteMessage();
          deleteModal.showModal();
        });
      });

    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Error loading feedback: ${err.message}</td></tr>`;
    }
  }

  closeModalBtn.addEventListener("click", () => {
    modal.close();
  });

confirmDeleteBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/coach/feedback/${currentFeedbackId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    if (!res.ok) throw new Error(await res.text());

    feedbackRowToDelete.remove();
    showDeleteMessage("✅ Feedback deleted successfully", true);

    setTimeout(() => {
      deleteModal.close();
      clearDeleteMessage();
    }, 2000);

  } catch (err) {
    showDeleteMessage("❌ Failed to delete feedback: " + err.message, false);
    setTimeout(() => {
      deleteModal.close();
      clearDeleteMessage();
    }, 2500);
  }
});

  function showDeleteMessage(msg, success = true) {
  deleteMessageBox.innerText = msg;
  deleteMessageBox.className = "form-feedback mb-2 " + (success ? "success" : "error");
  deleteMessageBox.style.display = "block";
}

  function clearDeleteMessage() {
    deleteMessageBox.innerText = "";
    deleteMessageBox.className = "form-feedback mb-2";
    deleteMessageBox.style.display = "none";
  }

  function showFormFeedback(msg, success = true) {
    clearFormFeedback();
    const feedback = document.createElement("div");
    feedback.className = "form-feedback " + (success ? "success" : "error");
    feedback.innerText = msg;
    editForm.querySelector("section").insertAdjacentElement("beforebegin", feedback);
  }

  function clearFormFeedback() {
    editForm.querySelectorAll(".form-feedback").forEach(e => e.remove());
    editForm.querySelectorAll(".invalid-feedback").forEach(e => {
      e.style.display = "none";
    });
    editForm.querySelectorAll(".is-invalid").forEach(input => {
      input.classList.remove("is-invalid");
    });
  }

  function addFieldError(input, message) {
    const error = input.parentElement.querySelector(".invalid-feedback");
    input.classList.add("is-invalid");
    if (error) {
      error.innerText = message;
      error.style.display = "block";
    } else {
      const newError = document.createElement("div");
      newError.className = "invalid-feedback";
      newError.innerText = message;
      input.after(newError);
    }
  }

  function showToast(message) {
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    clearFormFeedback();

    let valid = true;

    if (!editDate.value || !editTime.value) {
      showFormFeedback("Please fill in date and time", false);
      valid = false;
    }

    if (!editNutrition.value.trim()) {
      addFieldError(editNutrition, "This field is required");
      valid = false;
    }
    if (!editExercise.value.trim()) {
      addFieldError(editExercise, "This field is required");
      valid = false;
    }
    if (!editGeneral.value.trim()) {
      addFieldError(editGeneral, "This field is required");
      valid = false;
    }

    if (!valid) return;

    const updatedData = {
      datetime: new Date(`${editDate.value}T${editTime.value}`),
      tips: {
        nutrition: editNutrition.value.trim(),
        exercise: editExercise.value.trim(),
        general: editGeneral.value.trim()
      }
    };

    try {
      const res = await fetch(`${BASE_URL}/api/coach/feedback/${currentFeedbackId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      });

      if (!res.ok) throw new Error(await res.text());
      showFormFeedback("✅ Feedback updated successfully!");
      await loadFeedbacks();
      setTimeout(() => modal.close(), 1000);

    } catch (err) {
      showFormFeedback("❌ Failed to update feedback: " + err.message, false);
    }
  });

  loadFeedbacks();
});