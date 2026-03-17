import axios from "axios";

/* =====================================================
   BASE URL CONFIGURATION
   ===================================================== */

// If environment variable exists → use it
// Otherwise fallback to production backend

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://erb-system-drze.vercel.app";

if (!BASE_URL) {
  console.error("VITE_API_URL is missing!");
}

/* =====================================================
   AXIOS INSTANCE
   ===================================================== */

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 60000, // 60 seconds (Render cold start safe)
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
      console.error("Request timeout. Backend may be sleeping.");
      alert("Server is waking up... please try again in a few seconds.");
    }

    // 🔐 Unauthorized
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.replace("/login");
    }

    // 🔐 Forbidden
    if (error.response?.status === 403) {
      console.error("Access denied: insufficient role permissions.");
    }

    return Promise.reject(error);
  }
);

export default api;
