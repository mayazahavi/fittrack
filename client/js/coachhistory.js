import { BASE_URL } from './config.js';

console.log("🧠 coachhistory.js loaded!");

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('feedbackTableBody');
    const modal = document.getElementById("editModal");
    const closeModalBtn = document.getElementById("closeEditModal");
    const editForm = document.getElementById("editFeedbackForm");

    let currentFeedbackId = null;

    async function loadFeedbacks() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Please login to view feedback history.</td></tr>';
                return;
            }

            const res = await fetch(`${BASE_URL}/api/coach/feedback`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                const errorText = await res.text();
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Error loading feedback: ${res.status}</td></tr>`;
                return;
            }

            const feedbacks = await res.json();
            if (!feedbacks.length) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No feedback history available.</td></tr>';
                return;
            }

            tableBody.innerHTML = '';

            feedbacks.forEach(fb => {
                const dateObj = new Date(fb.datetime);
                const dateStr = dateObj.toISOString().split("T")[0];
                const timeStr = dateObj.toTimeString().split(" ")[0].slice(0, 5);
                const traineeName = fb.trainee?.username || fb.trainee || 'Unknown';

                const tipsText =
                    `Nutrition: ${fb.tips?.nutrition || "No feedback"}\n` +
                    `Exercise: ${fb.tips?.exercise || "No feedback"}\n` +
                    `General: ${fb.tips?.general || "No feedback"}`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${traineeName}</td>
                    <td>${dateStr}</td>
                    <td>${timeStr}</td>
                    <td><pre>${tipsText}</pre></td>
                    <td class="actions">
                        <button class="edit-btn" data-id="${fb._id}">✏️ Edit</button>
                        <button class="delete-btn" data-id="${fb._id}">🗑️ Delete</button>
                    </td>
                `;

                tableBody.appendChild(row);

                // Delete
                row.querySelector(".delete-btn").addEventListener("click", async () => {
                    const confirmDelete = confirm("Are you sure you want to delete this feedback?");
                    if (!confirmDelete) return;

                    try {
                        const deleteRes = await fetch(`${BASE_URL}/api/coach/feedback/${fb._id}`, {
                            method: "DELETE",
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });

                        if (!deleteRes.ok) throw new Error(await deleteRes.text());
                        row.remove();

                    } catch (err) {
                        alert("❌ Failed to delete feedback: " + err.message);
                    }
                });

                // Edit
                row.querySelector(".edit-btn").addEventListener("click", () => {
                    currentFeedbackId = fb._id;
                    document.getElementById("editDate").value = dateStr;
                    document.getElementById("editTime").value = timeStr;
                    document.getElementById("editNutrition").value = fb.tips?.nutrition || "";
                    document.getElementById("editExercise").value = fb.tips?.exercise || "";
                    document.getElementById("editGeneral").value = fb.tips?.general || "";
                    modal.classList.remove("hidden");
                });
            });

        } catch (err) {
            console.error('❌ Error loading feedback history:', err);
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Error loading feedback: ${err.message}</td></tr>`;
        }
    }

    // סגירת המודל
    closeModalBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // שליחת עריכה
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

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
            modal.classList.add("hidden");
            await loadFeedbacks();

        } catch (err) {
            alert("❌ Failed to update feedback: " + err.message);
        }
    });

    loadFeedbacks();
});
