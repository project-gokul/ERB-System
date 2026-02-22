import axios from "axios";

// 🔥 Always define API base URL clearly
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://dept-system-mph4.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // safer if you ever use cookies
  timeout: 15000,
});

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Attach JWT token if exists
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
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Session expired. Logging out...");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      alert("You do not have permission to perform this action.");
    }

    return Promise.reject(error);
  }
);

export default api;