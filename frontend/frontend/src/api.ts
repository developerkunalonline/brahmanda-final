import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

export const apiClient = axios.create({
  // --- THIS IS THE CRITICAL CHANGE ---
  // Update this URL to point to your live backend server.
  baseURL: "http://10.22.198.160:8000/api/v1",
  
  headers: { "Content-Type": "application/json" },
});

// Request interceptor to add the auth token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    // We are currently in dev mode, but this logic is correct for production
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling global 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // This will automatically log the user out if their token is invalid
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);