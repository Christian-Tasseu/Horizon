import { journalRepository } from "../repositories/journal.repository.js";

export const journalService = {
    async createJournal({ userId, content }) {
        return await journalRepository.createJournal({ user_id: userId, content });
    }
}