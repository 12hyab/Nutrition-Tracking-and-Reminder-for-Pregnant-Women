const form = document.getElementById("supplementForm");
const tbody = document.querySelector("#supplementTable tbody");
const goToReminders = document.getElementById("goToReminders");
const addTimeBtn = document.getElementById("addTimeBtn");
const timesContainer = document.getElementById("timesContainer");
const token = localStorage.getItem("token");

if (!token) window.location.href = "login.html";

addTimeBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "time";
  input.className = "timeInput";
  input.required = true;
  timesContainer.appendChild(input);
});

// Add supplement row to table
function addSupplementRow(supplement, reminders = []) {
  const tr = document.createElement("tr");

  // Combine times + reminders info
  const reminderTimes = reminders.length
    ? reminders.map(r => new Date(r.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})).join(", ")
    : supplement.times.join(", ");

  const intakeStatus = supplement.intakeHistory && supplement.intakeHistory.length
    ? supplement.intakeHistory[supplement.intakeHistory.length - 1].status
    : "Pending";

  tr.innerHTML = `
    <td>${supplement.name}</td>
    <td>${supplement.dosage || ""}</td>
    <td>${supplement.frequency}</td>
    <td>${reminderTimes}</td>
    <td>${supplement.notes || ""}</td>
    <td>${intakeStatus}</td>
  `;

  tbody.appendChild(tr);
}

// Load existing supplements with reminders
async function loadSupplements() {
  try {
    const res = await fetch("http://localhost:5000/api/supplements", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load supplements");

    const supplements = await res.json();
    tbody.innerHTML = "";

    for (const supp of supplements) {
      // Fetch reminders for this supplement
      const remRes = await fetch(`http://localhost:5000/api/reminders?supplementId=${supp._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reminders = remRes.ok ? await remRes.json() : [];
      addSupplementRow(supp, reminders);
    }

  } catch (err) {
    console.error("Error loading supplements:", err.message);
  }
}
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const dosage = document.getElementById("dosage").value.trim();
  const repeat = document.getElementById("repeat").value;
  const notes = document.getElementById("notes").value.trim();

  const times = Array.from(document.querySelectorAll(".timeInput"))
                     .map(input => input.value)
                     .filter(t => t);

  if (!name || times.length === 0) {
    alert("Please fill in all required fields.");
    return;
  }

  const supplement = { name, dosage, time: times, repeat, notes };

  try {
    const res = await fetch("http://localhost:5000/api/supplements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(supplement)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Server error");

    // Use returned reminders from backend
    addSupplementRow(data.supplement, data.reminders);

    form.reset();
    timesContainer.innerHTML = '<input type="time" class="timeInput" required />';
  } catch (err) {
    console.error("Error adding supplement:", err.message);
    alert(err.message);
  }
});

goToReminders.addEventListener("click", () => {
  window.location.href = "reminder.html";
});

loadSupplements();
