document.addEventListener("DOMContentLoaded", async () => {
  const ctx = document.getElementById("caloriesChart").getContext("2d");
  const noDataMsg = document.getElementById("noDataMessage");
  const token = localStorage.getItem("token");

  if (!token) {
    noDataMsg.textContent = "Unauthorized. Please log in.";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/entries", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const allEntries = await res.json();
    const today = new Date().toISOString().split("T")[0];
    const todayEntries = allEntries.filter(e => e.date === today);

    if (todayEntries.length === 0) {
      noDataMsg.textContent = "No meal data available for today.";
      return;
    }

    // סיכום הקלוריות לפי שם מאכל
    const caloriesByMeal = {};

    todayEntries.forEach(entry => {
      if (entry.caloriesPerMeal && Array.isArray(entry.caloriesPerMeal)) {
        entry.caloriesPerMeal.forEach(meal => {
          const name = meal.name || "Unknown";
          const cal = Number(meal.calories || 0);
          if (!caloriesByMeal[name]) {
            caloriesByMeal[name] = 0;
          }
          caloriesByMeal[name] += cal;
        });
      }
    });

    // הכנת נתונים לגרף
    const labels = Object.keys(caloriesByMeal);
    const data = Object.values(caloriesByMeal);

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          label: "Calories per Meal",
          data: data,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Calories Breakdown by Meal (Today)'
          }
        }
      }
    });

  } catch (err) {
    console.error("Error loading chart:", err);
    noDataMsg.textContent = "An error occurred while loading data.";
  }
});
