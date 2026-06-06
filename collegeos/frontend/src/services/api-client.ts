import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
  withCredentials: true
});

// Global 401 handler — session expired or backend restarted.
// Clears auth state so the app redirects to the unlock page.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().setAuthState({
        hasUser: true,
        authenticated: false,
        initialized: true
      });
    }
    return Promise.reject(error);
  }
);
