import { BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const roleSelect = document.getElementById("role");

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  const roleError = document.getElementById("role-error");
  const usernameError = document.getElementById("username-error");
  const passwordError = document.getElementById("password-error");
  const formFeedback = document.getElementById("form-feedback");
  const params = new URLSearchParams(window.location.search);
  const roleFromURL = params.get("role");
  if (roleFromURL === "trainee" || roleFromURL === "coach") {
    roleSelect.value = roleFromURL;
    roleSelect.disabled = true;
  }
  const clearErrors = () => {
    roleError.textContent = "";
    usernameError.textContent = "";
    passwordError.textContent = "";
    roleError.style.display = "none";
    usernameError.style.display = "none";
    passwordError.style.display = "none";
    formFeedback.textContent = "";
    formFeedback.style.display = "none";
    formFeedback.className = "feedback-msg";
  };
  const showFeedback = (msg, type = "error") => {
    formFeedback.textContent = msg;
    formFeedback.classList.add(type === "success" ? "feedback-success" : "feedback-error");
    formFeedback.style.display = "block";
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleSelect.value;
    let hasError = false;

    if (!role) {
      roleError.textContent = "Please select your role.";
      roleError.style.display = "block";
      hasError = true;
    }
    if (!username) {
      usernameError.textContent = "Username is required.";
      usernameError.style.display = "block";
      hasError = true;
    }
    if (!password) {
      passwordError.textContent = "Password is required.";
      passwordError.style.display = "block";
      hasError = true;
    }
    if (hasError) return;

    try {
      const res = await fetch(`${BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username); 
      showFeedback("Login successful!", "success");

      setTimeout(() => {
        if (data.role === "coach") {
          window.location.href = "coachdashboard.html";
        } else {
          window.location.href = "traineeprofile.html";
        }
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      showFeedback("Login failed: " + err.message, "error");
    }
  });
});
