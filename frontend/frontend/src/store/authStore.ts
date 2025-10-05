// src/store/authStore.ts
import { create } from "zustand";
import { apiClient } from "@/api";

interface User {
  id: string;
  username: string;
  email: string;
  created_at?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (token: string, user: User) => void;
  // --- RE-INTRODUCE setToken ---
  setToken: (token: string) => void;
  initializeAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("accessToken"),
  user: null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  isAuthLoading: true,

  // This is perfect for the SIGNUP flow
  login: (token, user) => {
    localStorage.setItem("accessToken", token);
    set({ token, user, isAuthenticated: true, isAuthLoading: false });
  },

  // --- THIS FUNCTION IS REQUIRED FOR THE LOGIN FLOW ---
  setToken: (token) => {
    localStorage.setItem("accessToken", token);
    // Also update the token in the live Zustand state so initializeAuth can use it immediately.
    set({ token });
  },

  // This function validates any token present in the store
  initializeAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const response = await apiClient.get<User>("/auth/me");
      set({ user: response.data, isAuthenticated: true, isAuthLoading: false });
    } catch (error) {
      localStorage.removeItem("accessToken");
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isAuthLoading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
