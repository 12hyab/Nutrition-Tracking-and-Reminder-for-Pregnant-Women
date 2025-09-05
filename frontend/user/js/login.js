document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (!loginForm) return console.warn("Login form not found.");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim() || "";
    const password = document.getElementById("password")?.value || "";

    if (!email || !password) return alert("Please enter both email and password.");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.message || "Login failed");

      // Save session info
      localStorage.setItem("isLoggedIn", "true");            
      localStorage.setItem("token", data.token);              
      localStorage.setItem("role", data?.user?.role || "user");
      localStorage.setItem("fullName", data?.user?.fullName || "");
      localStorage.setItem("email", data?.user?.email || "");

      // Redirect based on role
      if (data?.user?.role === "admin") {
        window.location.href = "../../admin/page/adminDashbord.html";
      } else {
        window.location.href = "../pages/index.html";
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Check console for details.");
    }
  });
});
