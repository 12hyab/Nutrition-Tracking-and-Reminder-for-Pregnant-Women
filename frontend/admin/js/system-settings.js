const API_BASE = "http://localhost:5000/api/admin";
const form = document.getElementById("settingsForm");

// Load settings and populate form
async function loadSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    document.getElementById("reminderFreq").value = data.reminderFreq || "";
    document.getElementById("defaultSupplements").value = data.defaultSupplements || "";
    document.getElementById("alertThreshold").value = data.alertThreshold || "";
  } catch (err) {
    console.error("Error fetching system settings:", err);
    alert("Failed to load settings. Check console for details.");
  }
}

// Submit handler to save settings
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const settings = {
    reminderFreq: document.getElementById("reminderFreq").value,
    defaultSupplements: document.getElementById("defaultSupplements").value,
    alertThreshold: document.getElementById("alertThreshold").value
  };

  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(settings)
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    alert("Settings saved!");
  } catch (err) {
    console.error("Error saving settings:", err);
    alert("Failed to save settings. Check console for details.");
  }
});
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
});
