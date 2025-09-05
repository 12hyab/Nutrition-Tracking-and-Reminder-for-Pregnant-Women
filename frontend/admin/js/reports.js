const downloadCsvBtn = document.getElementById("downloadCsv");
const downloadPdfBtn = document.getElementById("downloadPdf");
const exportAllBtn = document.getElementById("exportAll");

let currentData = []; 
const BASE_URL = "http://localhost:5000/api/admin"; 

async function fetchReport(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/reports/nutrition?${params}`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  });

  if (!res.ok) {
    console.error("Failed to fetch report:", res.status);
    currentData = [];
    return;
  }

  const data = await res.json();
  currentData = data;
  renderChart(data); 
}

// Export helpers (CSV/PDF)
function downloadCSV(data) {
  if (!data || data.length === 0) return alert("No data to export");

  let csv = "User,Email,Date,Calories,Protein,Carbs,Fats\n";
  data.forEach(d => {
    csv += `${d.userName},${d.userEmail || ""},${new Date(d.date).toLocaleDateString()},${d.calories},${d.protein},${d.carbs},${d.fats}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "nutrition_report.csv";
  a.click();
}

function downloadPDF(data) {
  if (!data || data.length === 0) return alert("No data to export");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Nutrition Report", 20, 20);

  let y = 30;
  data.forEach(d => {
    const line = `User: ${d.userName} | Email: ${d.userEmail || ""} | Date: ${new Date(d.date).toLocaleDateString()} | Calories: ${d.calories} | Protein: ${d.protein} | Carbs: ${d.carbs} | Fats: ${d.fats}`;
    doc.text(line, 10, y);
    y += 10;
    if (y > 280) { doc.addPage(); y = 20; }
  });

  doc.save("nutrition_report.pdf");
}

// Apply filters button
document.getElementById("applyFilters").addEventListener("click", () => {
  const filters = {
    userId: document.getElementById("userSelect").value,
    trimester: document.getElementById("trimester").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value
  };
  fetchReport(filters);
});

// Export buttons
downloadCsvBtn.addEventListener("click", () => downloadCSV(currentData));
downloadPdfBtn.addEventListener("click", () => downloadPDF(currentData));

exportAllBtn.addEventListener("click", async () => {
  const res = await fetch(`${BASE_URL}/reports/nutrition/all`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  });

  if (!res.ok) return alert("Failed to fetch all data");
  const data = await res.json();
  downloadCSV(data);
  // downloadPDF(data); 
});


fetchReport();
