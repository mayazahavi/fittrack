document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  document.querySelectorAll(".error-msg").forEach(msg => {
    msg.textContent = "";
    msg.style.display = "none";
  });

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

  try {
    const res = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });

    if (!res.ok) {
      const errData = await res.json();
      alert(errData.error || "Login failed.");
      return;
    }

    const data = await res.json();

    // ✅ שמירה של פרטי המשתמש והטוקן
    localStorage.setItem("username", data.username);
    localStorage.setItem("role", data.role);
    localStorage.setItem("token", data.token); // ⬅️ חשוב מאוד

    // ✅ ניווט לדף המתאים
    if (data.role === "coach") {
      window.location.href = "coach-dashboard.html";
    } else {
      window.location.href = "dashboard.html";
    }

  } catch (err) {
    console.error("Login error:", err);
    alert("Server error. Please try again later.");
  }
});
