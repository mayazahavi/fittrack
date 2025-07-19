import { BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const feedbackList = document.getElementById("feedbackList");
  feedbackList.innerHTML = "Loading feedback...";

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
  const token = localStorage.getItem("token");
  if (!token) {
    feedbackList.innerHTML = "<p>No token found, please login first.</p>";
    return;
  }
  const decoded = parseJwt(token);
  const traineeId = decoded?.id;
  if (!traineeId) {
    feedbackList.innerHTML = "<p>Invalid token: trainee ID missing.</p>";
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}/api/coach/feedback/by-trainee?traineeId=${traineeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to load feedback");
    const feedbacks = await res.json();
    if (feedbacks.length === 0) {
      feedbackList.innerHTML = "<p>No feedback found for this trainee.</p>";
      return;
    }
    feedbackList.innerHTML = "";
    feedbacks.forEach(fb => {
      const card = document.createElement("article");
      card.className = "feedback-card";
      card.innerHTML = `
        <h3>Feedback from ${new Date(fb.datetime).toLocaleDateString()}</h3>
        <p><strong>Nutrition:</strong> ${fb.tips.nutrition || "No feedback"}</p>
        <p><strong>Exercise:</strong> ${fb.tips.exercise || "No feedback"}</p>
        <p><strong>General:</strong> ${fb.tips.general || "No feedback"}</p>
      `;
      feedbackList.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    feedbackList.innerHTML = "<p>Error loading feedback.</p>";
  }
});
