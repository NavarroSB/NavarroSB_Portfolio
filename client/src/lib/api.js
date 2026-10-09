const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")
  || (import.meta.env.DEV ? "http://localhost:3000" : "");

export async function submitContactForm(payload) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Could not reach the contact service. Please try again shortly.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    // Keep a useful fallback for non-JSON responses.
  }

  if (!response.ok) {
    throw new Error(data.message || "Unable to send your message.");
  }

  return data;
}
