import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh")
      .then((res) => res.data)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";

    const skipRefresh =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (status === 401 && original && !original._retry && !skipRefresh) {
      original._retry = true;
      try {
        await refreshAccessToken();
        return api(original);
      } catch {
        // fall through
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(
      Object.assign(new Error(message), {
        status,
        errors: error.response?.data?.errors || [],
      })
    );
  }
);

export default api;
