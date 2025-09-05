// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
if (menuToggle) menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));

// Sanitize HTML
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Check login
if (localStorage.getItem("isLoggedIn") !== "true") {
  alert("Please log in to access your profile.");
  window.location.href = "login.html";
} else {
  // Load user data
  const fields = [
    'fullName','email','age','phone','address','birthStatus','edd','trimester',
    'preWeight','currentWeight','height','allergies','waterIntake','activityLevel',
    'chronicConditions','pastPregnancyIssues','supplements','bloodType','reminderMethod'
  ];

  fields.forEach(field => {
    const value = sanitizeHTML(localStorage.getItem(field) || '');
    const el = document.getElementById(field);
    if (el) {
      el.textContent = value || 'Not provided';
      if (!value) {
        el.style.color = '#999';
        el.style.fontStyle = 'italic';
      }
    }
  });

  // Welcome message
  const fullName = localStorage.getItem("fullName") || '';
  const welcomeEl = document.getElementById('welcomeMessage');
  if (fullName && welcomeEl) {
    welcomeEl.textContent = `Welcome, ${fullName.split(' ')[0]}!`;
  }
}
// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    // Clear session
    localStorage.clear();
    window.location.href = "login.html";
  });
}
