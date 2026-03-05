import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// 🔥 attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't override Content-Type for FormData (file uploads) — let Axios set the boundary
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// 🔥 handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;