const API_BASE = "http://localhost:5000/api/admin";

export async function authorizedFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in as admin.");

  options.headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
    "Content-Type": options.method ? "application/json" : undefined
  };

  const res = await fetch(`${API_BASE}${endpoint}`, options);

  if (res.status === 401) throw new Error("Unauthorized - invalid or expired token");
  if (res.status === 403) throw new Error("Forbidden - admin access required");
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  return await res.json();
}
