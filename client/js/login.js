document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {
      const res = await fetch("/api/users/login", {
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

      alert("Login successful!");

      // הפניה לדף לפי תפקיד
      if (data.role === "coach") {
        window.location.href = "coachdashboard.html";
      } else if (data.role === "trainee") {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "dashboard.html"; // ברירת מחדל
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed: " + err.message);
    }
  });
});
