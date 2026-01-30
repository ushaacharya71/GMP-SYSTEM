import axios from "axios";

/* ================================
   BASE URL (SAFE FALLBACK)
================================ */
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/* ================================
   AXIOS INSTANCE
================================ */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // ⏱ prevents hanging requests
});

/* ================================
   REQUEST INTERCEPTOR
================================ */
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

/* ================================
   RESPONSE INTERCEPTOR
================================ */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;

      console.error(
        `❌ API Error [${status}] →`,
        data?.message || data || "Unknown error"
      );

      // 🔐 Auto logout ONLY for protected routes
      if (
        status === 401 &&
        !config.url.includes("/auth/login")
      ) {
        localStorage.clear();
        window.location.replace("/");
      }
    } else {
      console.error("❌ Network / CORS error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
