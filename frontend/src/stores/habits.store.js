import { defineStore } from 'pinia' ;
import { ref } from 'vue' ;
import { api } from '../services/api.js';

export const useHabitsStore = defineStore('habits', () => {
    const habits = ref([]);
    const logs = ref({});
    const archivedHabits = ref([])

    const fetchHabits = async () => {
        const {data} = await api.get('/habits');
        habits.value = data;
    }

    const createHabit = async ({ name, description, frequency, color}) => {
        await api.post('/habits', { name, description, frequency, color })
        await fetchHabits();
    }

    const updateHabit = async ({ id, name, description, color}) => {
        await api.patch(`/habits/${id}`, {name, description, color})
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
        await api.patch(`/habits/${id}/archive`)
        await Promise.all([fetchHabits(), fetchArchived()]);
    }

    const fetchArchived = async () => {
        const { data } = await api.get("/habits/archived")
        archivedHabits.value = data
    }

    const restoreHabit = async(id) => {
        await api.patch(`/habits/${id}/restore`)
        await Promise.all([fetchHabits(), fetchArchived()]);
    }

    return { habits, archivedHabits, logs, fetchHabits, createHabit, updateHabit, fetchLogs, logHabit, removeLog, archiveHabit, fetchArchived, restoreHabit }
})