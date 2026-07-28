// Base URL of the Flask API. Set VITE_API_URL in .env / Vercel project settings,
// e.g. VITE_API_URL=https://api.yourdomain.com
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ApiError {
  message: string;
}

export async function submitContactForm(payload: ContactPayload): Promise<void> {
  const res = await fetch(`${API_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }
}
