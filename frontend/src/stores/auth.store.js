import { defineStore } from 'pinia';
import { ref, computed} from 'vue';
import { api } from '../services/api.js';

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(null);
    const isLoggedIn = computed(() => accessToken.value !== null);
    const login = async (email, password) => {
        const {data} = await api.post('/auth/login', {email, password});
        accessToken.value = data.accessToken;
        localStorage.setItem('refreshToken', data.refreshToken);
    };
    const initialize = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                const { data } = await api.post('/auth/refresh', {refreshToken})
                accessToken.value = data.accessToken
                localStorage.setItem('refreshToken', data.refreshToken)
            } catch (error) {
                localStorage.removeItem('refreshToken');
            }
        }
    }

    return { accessToken, isLoggedIn, login, initialize };
});