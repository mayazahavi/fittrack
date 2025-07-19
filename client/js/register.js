import { BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const usernameError = document.getElementById("username-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    usernameError.textContent = "";
    usernameError.style.display = "none"; 
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
        if (data.error && data.error.toLowerCase().includes("username")) {
          usernameError.textContent = "Username already exists.";
          usernameError.style.display = "block"; 
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
