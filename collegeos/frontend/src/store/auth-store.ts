import { create } from "zustand";

type AuthState = {
  hasUser: boolean;
  authenticated: boolean;
  initialized: boolean;
  setAuthState: (state: Pick<AuthState, "hasUser" | "authenticated" | "initialized">) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  hasUser: true,
  authenticated: false,
  initialized: false,
  setAuthState: (state) => set(state)
}));
