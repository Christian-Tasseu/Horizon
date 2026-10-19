import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '../services/api.js';

export const useJournalStore = defineStore('journal', () => {
    const entries = ref([]);

    const fetchEntries = async () => {
        const {data}  = await api.get("/journal");
        entries.value = data;
    }

    const createEntry = async ({ content }) => {
        await api.post("/journal", {content})
        await fetchEntries();
    }

    const updateEntry = async ({ id, content}) => {
        await api.patch(`/journal/${id}`, {content})
        await fetchEntries();
    }

    return { entries, fetchEntries, createEntry, updateEntry }
})