import { create } from "zustand";

const AUTH_TOKEN_KEY = "collegeos_auth_token";

function getInitialToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  setSession: (token: string) => void;
  clearSession: () => void;
  setInitialized: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getInitialToken(),
  isAuthenticated: Boolean(getInitialToken()),
  initialized: false,
  setSession: (token) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    }

    set({ token, isAuthenticated: true, initialized: true });
  },
  clearSession: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    set({ token: null, isAuthenticated: false, initialized: true });
  },
  setInitialized: (value) => set({ initialized: value })
}));
