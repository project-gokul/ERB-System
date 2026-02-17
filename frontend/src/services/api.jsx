import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: false,
  timeout: 15000,
});

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // ✅ Attach JWT token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * ❌ DO NOT set Content-Type manually
     * Axios will automatically set:
     * - application/json for JSON
     * - multipart/form-data for FormData
     */

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired. Logging out...");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 403) {
      alert("You do not have permission to perform this action.");
    }

    return Promise.reject(error);
  }
);

export default api;