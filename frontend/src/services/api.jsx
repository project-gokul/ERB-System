import axios from "axios";

// ✅ Make sure environment variable exists
const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_URL is not defined in environment variables");
}

// ✅ Create axios instance
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  timeout: 50000, // ⬆ Increased to 60 seconds (Render free plan safe)
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 Handle timeout separately
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Backend might be sleeping.");
      alert("Server is waking up... please try again in a few seconds.");
    }

    // 🔐 Handle unauthorized
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default api;