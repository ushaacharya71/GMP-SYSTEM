import axios from "axios";

/* ================================
   BASE URL (ENV DRIVEN)
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
  timeout: 15000,
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
   RESPONSE INTERCEPTOR (FIXED)
================================ */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;

      console.error(
        `❌ API Error [${status}] →`,
        data?.message || "Unknown error"
      );

      const message = data?.message?.toLowerCase() || "";

      const isAuthError =
        status === 401 &&
        (message.includes("jwt") ||
         message.includes("token") ||
         message.includes("expired"));

      const isAuthRoute =
        config.url.includes("/auth/login") ||
        config.url.includes("/auth/forgot-password") ||
        config.url.includes("/auth/reset-password");

      // 🔐 Auto logout ONLY when token is invalid/expired
      if (isAuthError && !isAuthRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Optional: show session expired UX
        // alert("Session expired. Please login again.");

        window.location.replace("/login");
      }
    } else {
      console.error("❌ Network / Server error:", error.message);
    }

    return Promise.reject(error);
  }
);


export default api;
