const BASE_URL = "http://localhost:5000/api/admin";
const tbody = document.querySelector("#nutritionTable tbody");
const userSelect = document.getElementById("userSelect");
const trimesterSelect = document.getElementById("trimester");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

let currentData = []; 
//Get token and check admin
function getToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("No token found. Please login.");
    throw new Error("No token found");
  }
  return token;
}
async function authorizedFetch(url, options = {}) {
  const token = getToken();
  const res = await fetch(url.startsWith("http") ? url : `${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 403) {
    alert("Access forbidden: Admins only or invalid token.");
    throw new Error("403 Forbidden");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Fetch error: ${res.status} - ${errorText}`);
  }

  return res.json();
}
async function loadUsers() {
  try {
    const users = await authorizedFetch("/users");
    users.forEach((u) => {
      const option = document.createElement("option");
      option.value = u._id;
      option.textContent = `${u.name} (${u.email})`;
      userSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load users:", err);
    tbody.innerHTML = "<tr><td colspan='7'>Failed to load users</td></tr>";
  }
}
async function fetchNutrition() {
  try {
    const params = new URLSearchParams({
      userId: userSelect.value,
      trimester: trimesterSelect.value,
      startDate: startDateInput.value,
      endDate: endDateInput.value,
    }).toString();

    const data = await authorizedFetch(`/nutrition?${params}`);
    renderTable(data);
  } catch (err) {
    console.error("Failed to fetch nutrition:", err);
    tbody.innerHTML = "<tr><td colspan='7'>Failed to load data</td></tr>";
  }
}
function renderTable(data) {
  currentData = data;
  tbody.innerHTML = "";

  if (!Array.isArray(data) || !data.length) {
    tbody.innerHTML = "<tr><td colspan='7'>No data found</td></tr>";
    return;
  }

  data.forEach((n) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${n.userName}</td>
      <td>${n.userEmail}</td>
      <td>${new Date(n.date).toLocaleDateString()}</td>
      <td>${n.calories}</td>
      <td>${n.protein}</td>
      <td>${n.carbs}</td>
      <td>${n.fats}</td>
    `;
    tbody.appendChild(tr);
  });
}
// CSV Export
function downloadCSV(data) {
  if (!Array.isArray(data) || !data.length) return alert("No data to export");

  let csv = "User,Email,Date,Calories,Protein,Carbs,Fats\n";
  data.forEach((n) => {
    csv += `"${n.userName}","${n.userEmail}","${new Date(
      n.date
    ).toLocaleDateString()}","${n.calories}","${n.protein}","${n.carbs}","${n.fats}"\n`;
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "nutrition_history.csv";
  a.click();
}
// PDF Export
function downloadPDF(data) {
  if (!Array.isArray(data) || !data.length) return alert("No data to export");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Nutrition History Report", 20, 20);

  let y = 30;
  data.forEach((n) => {
    const line = `User: ${n.userName} | Email: ${n.userEmail} | Date: ${new Date(
      n.date
    ).toLocaleDateString()} | Calories: ${n.calories} | Protein: ${n.protein} | Carbs: ${n.carbs} | Fats: ${n.fats}`;
    doc.text(line, 10, y);
    y += 10;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("nutrition_history.pdf");
}
// Export all users
async function exportAllUsers() {
  try {
    const data = await authorizedFetch("/nutrition/all");
    downloadCSV(data);
  } catch (err) {
    console.error("Failed to export all users:", err);
    alert("Failed to export all users");
  }
}
// Event Listeners
document.getElementById("applyFilters").addEventListener("click", fetchNutrition);
document.getElementById("downloadCsv").addEventListener("click", () =>
  downloadCSV(currentData)
);
document.getElementById("downloadPdf").addEventListener("click", () =>
  downloadPDF(currentData)
);
document.getElementById("exportAll").addEventListener("click", exportAllUsers);
// Initial load
async function init() {
  await loadUsers();
  await fetchNutrition();
}
init();
