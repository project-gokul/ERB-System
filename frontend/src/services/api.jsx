import axios from "axios";

/* =====================================================
   BASE URL FIX
   ===================================================== */

// VITE_API_URL should NOT include /api
// Example:
// VITE_API_URL = https://erb-backend-sg4x.onrender.com

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_URL is not defined in environment variables");
}

/* =====================================================
   AXIOS INSTANCE
   ===================================================== */

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 60000, // 60 seconds for Render cold start
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================================================
   REQUEST INTERCEPTOR
   ===================================================== */

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

/* =====================================================
   RESPONSE INTERCEPTOR
   ===================================================== */

api.interceptors.response.use(
  (response) => response,
  (error) => {

    // 🔥 Timeout handling
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Backend might be sleeping.");
      alert("Server is waking up... please try again in a few seconds.");
    }

    // 🔐 Unauthorized (Token invalid or expired)
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.replace("/login");
    }

    // 🔐 Forbidden (Role issue)
    if (error.response?.status === 403) {
      console.error("Access denied: insufficient role permissions.");
    }

    return Promise.reject(error);
  }
);

export default api;