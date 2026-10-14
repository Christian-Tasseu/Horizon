import { defineStore } from 'pinia' ;
import { ref } from 'vue' ;
import { api } from '../services/api.js';

export const useHabitsStore = defineStore('habits', () => {
    const habits = ref([]);
    const logs = ref({});

    const fetchHabits = async () => {
        const {data} = await api.get('/habits');
        habits.value = data;
    }
    const createHabit = async ({ name, description, frequency, color}) => {
        await api.post('/habits', { name, description, frequency, color })
        await fetchHabits();
    }

    const fetchLogs = async (habitId) => {
        const { data } = await api.get(`/habits/${habitId}/logs`);
        logs.value[habitId] = data
    }

    const logHabit = async ({ habitId, logDate, completed, note }) => {
        await api.post(`/habits/${habitId}/logs`, { logDate, completed, note})
        await fetchLogs(habitId);
    }

    const removeLog = async ({ habitId, logId }) => {
        await api.delete(`/habits/${habitId}/logs/${logId}`);
        await fetchLogs(habitId);
    }

    const archiveHabit = async (id) => {
        await api.patch(`/habits/${id}`)
        await fetchHabits();
    }

    return { habits, logs, fetchHabits, createHabit, fetchLogs, logHabit, removeLog, archiveHabit }
})