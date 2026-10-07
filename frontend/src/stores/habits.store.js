import { defineStore } from 'pinia' ;
import { ref } from 'vue' ;
import { api } from '../services/api.js';

export const useHabitsStore = defineStore('habits', () => {
    const habits = ref([]);

    const fetchHabits = async () => {
        const {data} = await api.get('/habits');
        habits.value = data;
    }
    const createHabit = async ({ name, description, frequency, color}) => {
        await api.post('/habits', { name, description, frequency, color })
        await fetchHabits();
    }

    return { habits, fetchHabits, createHabit }
})