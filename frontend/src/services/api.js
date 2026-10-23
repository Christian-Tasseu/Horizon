import axios from "axios";
import { useAuthStore } from "../stores/auth.store.js";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url !== "/auth/login" &&
      original.url !== "/auth/refresh"
    ) {
      original._retry = true;
      const auth = useAuthStore();
      try {
        await auth.refresh();
        return api(original);
      } catch {
        await auth.logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
