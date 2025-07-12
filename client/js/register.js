import { BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const usernameError = document.getElementById("username-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ננקה הודעות שגיאה קודמות
    usernameError.textContent = "";
    usernameError.style.display = "none"; // נסתיר כל הודעה ישנה

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    try {
      const res = await fetch(`${BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        // אם זו שגיאה על שם משתמש תפוס – נציג מתחת לשדה
        if (data.error && data.error.toLowerCase().includes("username")) {
          usernameError.textContent = "Username already exists.";
          usernameError.style.display = "block"; // ✅ נחשוף את הודעת השגיאה
        } else {
          alert("Registration failed: " + (data.error || "Unknown error"));
        }
        return;
      }

      alert("Registration successful!");
      window.location.href = "login.html";

    } catch (err) {
      console.error("Register error:", err);
      alert("Registration failed: " + err.message);
    }
  });
});
