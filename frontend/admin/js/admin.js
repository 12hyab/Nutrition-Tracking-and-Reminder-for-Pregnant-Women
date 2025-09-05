const BASE_URL = "http://localhost:5000/api/admin";
const token = localStorage.getItem("token");
const elements = {
  activeUsers: document.getElementById("activeUsers"),
  nutritionLogs: document.getElementById("nutritionLogs"),
  reportsCount: document.getElementById("reportsCount"),
  logoutBtn: document.getElementById("logoutBtn"),
};
// Redirect to Login
function redirectToLogin(message = "You must be logged in") {
  alert(message);
  localStorage.clear();
  window.location.href = "../../user/pages/login.html"; // adjust path
  throw new Error(message);
}
if (!token) redirectToLogin();

//Logout
elements.logoutBtn?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../../user/pages/login.html";
});

//  Safe Fetch with JWT
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (res.status === 401 || res.status === 403) {
      redirectToLogin("Session expired, please log in again.");
      return null;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn(`Request failed for ${url}:`, data.message || res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err);
    return null;
  }
}
//nimated Counte
function animateCounter(el, target, duration = 1000) {
  if (!el || typeof target !== "number") return;

  let start = 0;
  const fps = 60;
  const totalFrames = Math.round((duration / 1000) * fps);
  const increment = target / totalFrames;

  const counter = setInterval(() => {
    start += increment;
    if (start >= target) {
      el.textContent = target;
      clearInterval(counter);
    } else {
      el.textContent = Math.ceil(start);
    }
  }, 1000 / fps);
}
//Loading State
function setLoading(isLoading = true) {
  const loaderText = isLoading ? "Loading..." : "N/A";
  for (const el of Object.values(elements)) {
    if (el) el.textContent = loaderText;
  }
}
//Fetch Dashboard Counts 
async function fetchCounts() {
  setLoading(true);
  console.log("Fetching dashboard counts...");

  const [users, nutrition, reports] = await Promise.all([
    safeFetch(`${BASE_URL}/users/count`),
    safeFetch(`${BASE_URL}/nutrition/count`),
    safeFetch(`${BASE_URL}/reports/count`),
  ]);

  animateCounter(elements.activeUsers, users?.count ?? 0);
  animateCounter(elements.nutritionLogs, nutrition?.count ?? 0);
  animateCounter(elements.reportsCount, reports?.count ?? 0);
  setLoading(false);
}
fetchCounts();
//Auto-refresh every 60s 
const refreshInterval = setInterval(() => {
  if (token) fetchCounts();
  else clearInterval(refreshInterval);
}, 60000);
