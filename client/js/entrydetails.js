document.addEventListener("DOMContentLoaded", async () => {
  const ctx = document.getElementById("caloriesChart").getContext("2d");
  const noDataMsg = document.getElementById("noDataMessage");

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/entries", { // ✅ שימוש בנתיב יחסי
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
      if (entry.meals && Array.isArray(entry.meals)) {
        entry.meals.forEach(meal => {
          const name = meal.name || "Unknown";
          const cal = Number(meal.calories || 0);
          caloriesByMeal[name] = (caloriesByMeal[name] || 0) + cal;
        });
      }
    });

    const labels = Object.keys(caloriesByMeal);
    const data = Object.values(caloriesByMeal);

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          label: "Calories",
          data: data,
          backgroundColor: [
            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
            "#9966FF", "#FF9F40", "#E7E9ED", "#76B041"
          ]
        }]
      },
      options: {
        responsive: true
      }
    });

  } catch (err) {
    console.error("Error fetching or displaying data:", err);
    noDataMsg.textContent = "Error loading data.";
  }
});
