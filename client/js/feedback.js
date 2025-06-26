document.addEventListener("DOMContentLoaded", () => {
  const feedbackList = document.getElementById("feedbackList");

  // דוגמה זמנית עד שיהיה שרת
  const feedbacks = [
    {
      title: "Great Job Today!",
      message: "Keep up the consistency. Try adding more protein to your meals."
    },
    {
      title: "Rest Day Tip",
      message: "Even on rest days, light stretching or a walk helps recovery."
    },
    {
      title: "Progress Note",
      message: "Your recent workouts show good intensity. Let’s aim for longer duration next week."
    }
  ];

  feedbacks.forEach(feedback => {
    const card = document.createElement("article");
    card.className = "feedback-card";
    card.innerHTML = `
      <h3>${feedback.title}</h3>
      <p>${feedback.message}</p>
    `;
    feedbackList.appendChild(card);
  });
});
