import { db } from "../config/database.js";

export const journalRepository = {
    async createJournal({ userId, content }) {
        const [result] = await db.query("INSERT INTO journal_entries (user_id, content) VALUES (?, ?)", [userId, content]);
        return result.insertId;
    }
};