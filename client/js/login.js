document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // ניקוי הודעות קודמות
  document.querySelectorAll(".error-msg").forEach(msg => msg.style.display = "none");

  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  let hasError = false;

  if (!role) {
    document.getElementById("role-error").textContent = "Please select a role.";
    document.getElementById("role-error").style.display = "block";
    hasError = true;
  }

  if (!username) {
    document.getElementById("username-error").textContent = "Please enter your username.";
    document.getElementById("username-error").style.display = "block";
    hasError = true;
  }

  if (!password) {
    document.getElementById("password-error").textContent = "Please enter your password.";
    document.getElementById("password-error").style.display = "block";
    hasError = true;
  }

  if (hasError) return;

  // מעבר לדשבורד לפי תפקיד
  if (role === "coach") {
    window.location.href = "coach-dashboard.html";
  } else {
    window.location.href = "trainee-dashboard.html";
  }
});
