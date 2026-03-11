import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { runSingleRefresh } from "../lib/refreshManager.js";

/**
 * Extract a readable error message from Axios errors.
 */
const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

/**
 * User authentication store.
 *
 * Responsibilities:
 * - Manage authenticated user state
 * - Handle signup, login, logout
 * - Verify authentication on app load
 * - Refresh expired access tokens
 *
 * Notes:
 * - Authentication state is persisted via cookies (handled by backend).
 * - `checkingAuth` prevents UI rendering before auth state is verified.
 * - Token refresh requests are coordinated via the refresh manager.
 */

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  /**
   * Register a new user account.
   * Validates password confirmation before sending request.
   */
  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.post("/auth/signup", { name, email, password });

      set({
        user: res.data.user,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      toast.error(getErrorMessage(error));
    }
  },

  /**
   * Authenticate an existing user.
   */
  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });

      set({
        user: res.data.user,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      toast.error(getErrorMessage(error));
    }
  },

  /**
   * Verify the current user's authentication state.
   * Called when the application initializes.
   */
  checkAuth: async () => {
    set({ checkingAuth: true });

    try {
      const res = await axios.get("/auth/profile");

      set({
        user: res.data,
        checkingAuth: false,
      });
    } catch (error) {
      set({
        user: null,
        checkingAuth: false,
      });
    }
  },

  /**
   * Refresh the user's access token using a valid refresh token.
   * Prevents multiple concurrent refresh requests.
   */
  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });

    try {
      const res = await axios.post("/auth/refresh-token");

      set({ checkingAuth: false });

      return res.data;
    } catch (error) {
      set({
        user: null,
        checkingAuth: false,
      });

      throw error;
    }
  },

  /**
   * Log the user out and clear authentication state.
   */
  logout: async () => {
    try {
      await axios.post("/auth/logout");

      set({
        user: null,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },
}));
