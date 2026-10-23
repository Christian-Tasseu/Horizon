import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "../services/api.js";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref(null);
  let refreshPromise = null;
  const isLoggedIn = computed(() => accessToken.value !== null);
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    accessToken.value = data.accessToken;
    localStorage.setItem("refreshToken", data.refreshToken);
  };
  const initialize = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const { data } = await api.post("/auth/refresh", { refreshToken });
        accessToken.value = data.accessToken;
        localStorage.setItem("refreshToken", data.refreshToken);
      } catch (error) {
        localStorage.removeItem("refreshToken");
      }
    }
  };
  const register = async (email, password, displayName) => {
    const { data } = await api.post("/auth/register", { email, password, displayName });
    accessToken.value = data.accessToken;
    localStorage.setItem("refreshToken", data.refreshToken);
  };

  const doRefresh = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const { data } = await api.post("/auth/refresh", { refreshToken });
      accessToken.value = data.accessToken;
      localStorage.setItem("refreshToken", data.refreshToken);
    } else {
      throw new Error("Erreur lors de la récupération du token d'actualisation");
    }
  };

  const refresh = async () => {
    if (refreshPromise === null) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      console.error("Erreur de déconnexion");
    }
    accessToken.value = null;
    localStorage.removeItem("refreshToken");
  };

  return { accessToken, isLoggedIn, login, register, initialize, logout, refresh };
});