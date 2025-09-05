const API_BASE = "http://localhost:5000/api/admin";

const tbodyUsers = document.querySelector("#usersTable tbody");
const nutritionModal = document.getElementById("nutritionModal");
const nutritionTable = document.getElementById("nutritionTable");
const closeModal = document.getElementById("closeModal");

// Fetch all users
async function fetchUsers() {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const users = await res.json();
    renderUsers(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    tbodyUsers.innerHTML = `<tr><td colspan="4">Failed to load users</td></tr>`;
  }
}

// Render users table
function renderUsers(users) {
  tbodyUsers.innerHTML = "";
  if (!users.length) {
    tbodyUsers.innerHTML = `<tr><td colspan="4">No users found</td></tr>`;
    return;
  }

  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.status}</td>
      <td>
        <button onclick="viewNutrition('${u._id}')">View History</button>
        <button onclick="changeStatus('${u._id}', 'Active')">Activate</button>
        <button onclick="changeStatus('${u._id}', 'Suspended')">Suspend</button>
        <button onclick="deleteUser('${u._id}')">Delete</button>
      </td>`;
    tbodyUsers.appendChild(tr);
  });
}

// Change user status
async function changeStatus(userId, status) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok) throw new Error(`Failed to update status: ${res.status}`);
    fetchUsers();
  } catch (err) {
    console.error(err);
    alert("Failed to change user status");
  }
}

// Delete a user
async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });

    if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
    fetchUsers();
  } catch (err) {
    console.error(err);
    alert("Failed to delete user");
  }
}

// View nutrition history
async function viewNutrition(userId) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/nutrition`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });

    if (!res.ok) throw new Error(`Failed to fetch nutrition: ${res.status}`);

    const nutrition = await res.json();
    renderNutrition(nutrition);
    nutritionModal.style.display = "block";
  } catch (err) {
    console.error(err);
    alert("Failed to load nutrition history");
  }
}

// Render nutrition table
function renderNutrition(nutrition) {
  nutritionTable.innerHTML = "";
  if (!nutrition.length) {
    nutritionTable.innerHTML = `<tr><td colspan="3">No records found</td></tr>`;
    return;
  }

  nutrition.forEach(n => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(n.date).toLocaleDateString()}</td>
      <td>${n.meal}</td>
      <td>${n.calories}</td>`;
    nutritionTable.appendChild(tr);
  });
}

// Modal close behavior
closeModal.onclick = () => (nutritionModal.style.display = "none");
window.onclick = (e) => {
  if (e.target == nutritionModal) nutritionModal.style.display = "none";
};

// Load users on page load
fetchUsers();
