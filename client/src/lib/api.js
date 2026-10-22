import axios from "axios";

// Dev: Vite proxies /api -> localhost:5000. Prod (Vercel): same origin, so "/api" just works.
export const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL, timeout: 90000 });

export function getToken() {
  try {
    return localStorage.getItem("geopharma_token");
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Pull a human-friendly message out of any axios error.
export function errorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err?.code === "ECONNABORTED") return "That took too long. Please try again.";
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response?.status === 413) return "That file is too large. Please upload one under 4MB.";
  if (err?.message === "Network Error") return "Can't reach the server. Check your connection and try again.";
  return fallback;
}

export default api;
