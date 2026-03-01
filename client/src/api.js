const DEFAULT_BASE_URL = "http://localhost:4000/api";

export async function apiRequest(path, { method = "GET", token, body, baseUrl } = {}) {
  const response = await fetch(`${baseUrl || DEFAULT_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed: ${response.status}`);
  }

  return data;
}
