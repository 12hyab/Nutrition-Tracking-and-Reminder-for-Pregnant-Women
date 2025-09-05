const form = document.getElementById("uploadForm");
const list = document.getElementById("contentList");

async function fetchContent() {
  const res = await fetch("/api/admin/content", {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  });
  const data = await res.json();

  list.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `${item.title} - <a href="${item.url}" target="_blank">View</a>
                    <button onclick="deleteContent('${item._id}')">Delete</button>`;
    list.appendChild(li);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    body: formData
  });
  fetchContent();
});

async function deleteContent(id) {
  await fetch(`/api/admin/content/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  });
  fetchContent();
}

fetchContent();
