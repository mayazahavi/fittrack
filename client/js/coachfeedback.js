document.addEventListener("DOMContentLoaded", () => {
  const traineeSelect = document.getElementById("traineeSelect");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const traineeDataContent = document.getElementById("traineeDataModalContent");
  const coachForm = document.getElementById("coachForm");
  const formError = document.getElementById("form-error");
  const showDataBtn = document.getElementById("showTraineeDataBtn");

  // פונקציה להחזרת תאריך היום בפורמט yyyy-mm-dd
  function getTodayDateISO() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  // טען רשימת מתאמנים עם טוקן אימות
  async function loadTrainees() {
    console.log("loadTrainees: התחלת טעינת מתאמנים...");
    try {
      const res = await fetch("/api/users/trainees", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      console.log("loadTrainees: סטטוס תגובת השרת:", res.status);
      if (!res.ok) throw new Error("Failed to load trainees");
      const trainees = await res.json();
      console.log("loadTrainees: מתאמנים שהתקבלו:", trainees);
      trainees.forEach(t => {
        console.log("loadTrainees: מוסיף מתאמן:", t.username);
        const option = document.createElement("option");
        option.value = t._id;
        option.textContent = t.username;
        traineeSelect.appendChild(option);
      });
    } catch (err) {
      console.error("loadTrainees: שגיאה בטעינת מתאמנים:", err);
      alert("Error loading trainees: " + err.message);
    }
  }

  // קבלת כל נתוני המתאמן, ממוינים מהחדש לישן
  async function loadTraineeData() {
    const traineeId = traineeSelect.value;
    if (!traineeId) {
      traineeDataContent.innerHTML = "Please select a trainee.";
      console.warn("loadTraineeData: מתאמן לא נבחר");
      return;
    }
    try {
      // בקשה לקבלת כל ההזנות של המתאמן, ללא הגבלת תאריך
      const res = await fetch(`/api/entries?traineeId=${traineeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      console.log("loadTraineeData: סטטוס תגובת השרת:", res.status);
      if (!res.ok) throw new Error("Failed to load trainee data");
      let data = await res.json();
      console.log("loadTraineeData: נתוני המתאמן שהתקבלו:", data);

      if (!data.length) {
        traineeDataContent.innerHTML = "No data found for this trainee.";
        return;
      }

      // מיין את ההזנות מהחדש לישן לפי תאריך ושעה
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
      console.error("loadTraineeData: שגיאה בטעינת נתוני מתאמן:", err);
    }
  }

  // הפעלת טעינת המתאמנים בעת טעינת הדף
  loadTrainees();

  // טעינת נתונים חדשים כשמשנים מתאמן או תאריך
  traineeSelect.addEventListener("change", () => {
    // כאן נטען כל הנתונים בלי תלות בתאריך כי רוצים הכל
    loadTraineeData();
  });

  // מאזין ללחיצה על כפתור הצגת נתוני מתאמן
  showDataBtn.addEventListener("click", () => {
    if (!traineeSelect.value) {
      alert("Please select a trainee first.");
      return;
    }
    // הגדר תאריך היום (אם תרצי, אפשר להסתיר שדה תאריך כי לא רלוונטי עכשיו)
    dateInput.value = getTodayDateISO();

    // טען את כל הנתונים של המתאמן
    loadTraineeData();
  });

  // שליחת הפידבק
  coachForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.textContent = "";
    console.log("Submitting feedback form...");

    const payload = {
      traineeId: traineeSelect.value,
      datetime: `${dateInput.value}T${timeInput.value}`,
      tips: {
        nutrition: document.getElementById("tipNutrition").value.trim(),
        exercise: document.getElementById("tipExercise").value.trim(),
        general: document.getElementById("tipGeneral").value.trim()
      }
    };

    if (!payload.traineeId || !payload.datetime) {
      formError.textContent = "Please select trainee and date/time.";
      console.warn("Feedback form submission failed: Missing trainee or datetime.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/coach/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      console.log("Feedback submission response status:", res.status);
      if (!res.ok) throw new Error("Failed to send feedback");
      alert("Feedback sent successfully!");
      coachForm.reset();
      traineeDataContent.innerHTML = "Please select a trainee.";
    } catch (err) {
      formError.textContent = "Error sending feedback: " + err.message;
      console.error("Feedback submission error:", err);
    }
  });
});
