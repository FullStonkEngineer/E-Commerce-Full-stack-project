import axios from "axios";
import { useUserStore } from "../stores/useUserStore.js";
import { runSingleRefresh } from "./refreshManager.js";

/**
 * Central Axios instance used across the frontend.
 *
 * Responsibilities:
 * - Configure API base URL depending on environment
 * - Send cookies automatically (JWT stored in cookies)
 * - Handle automatic token refresh on 401 responses
 */
const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "/api",
  withCredentials: true,
});

/**
 * Response interceptor for handling expired access tokens.
 *
 * Flow:
 * 1. If a request returns 401, attempt to refresh the access token.
 * 2. Only retry once to prevent infinite loops.
 * 3. If refresh succeeds, retry the original request.
 * 4. If refresh fails, log the user out.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, logout } = useUserStore.getState();

      try {
        await runSingleRefresh(refreshToken);

        // Retry original request after successful refresh
        return axiosInstance(originalRequest);
      } catch {
        // If refresh fails, clear user session
        logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
