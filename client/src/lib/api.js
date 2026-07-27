import axios from "axios";

// In dev, Vite proxies /api to the local Express server (see vite.config.js).
// In prod, set VITE_API_URL to wherever the server is deployed on Vercel.
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("geopharma_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
