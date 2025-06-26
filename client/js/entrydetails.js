document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("caloriesChart").getContext("2d");
  const noDataMsg = document.getElementById("noDataMessage");

  // נשלוף את הנתונים מה-localStorage
  const entries = JSON.parse(localStorage.getItem("caloriesEntries")) || [];

  if (entries.length === 0) {
    noDataMsg.textContent = "No data available. Please add entries first.";
    return;
  }

  const caloriesByType = {};

  entries.forEach(entry => {
    const type = entry.mealType || "Other";
    const calories = Number(entry.calories) || 0;
    if (!caloriesByType[type]) {
      caloriesByType[type] = 0;
    }
    caloriesByType[type] += calories;
  });

  const labels = Object.keys(caloriesByType);
  const data = Object.values(caloriesByType);

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        label: "Calories",
        data: data,
        backgroundColor: [
          "#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        },
        title: {
          display: true,
          text: "Calories by Meal Type"
        }
      }
    }
  });
});
