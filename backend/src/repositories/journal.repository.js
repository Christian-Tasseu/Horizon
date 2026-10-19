import { db } from "../config/database.js";

export const journalRepository = {
    async createJournal({ userId, content }) {
        const [result] = await db.query("INSERT INTO journal_entries (user_id, content) VALUES (?, ?)", [userId, content]);
        return result.insertId;
    },

    async findById({ id }){
        const [result] = await db.query("SELECT id, user_id, content, mood, created_at FROM journal_entries WHERE id = ?", [id])
        return result[0] || null;
    },

    async findAllByUser({ userId }) {
        const [result] = await db.query("SELECT id, content, mood, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC, id DESC", [userId])
        return result || [];
    },

    async updateJournal({id, content}) {
        await db.query("UPDATE journal_entries SET content = ? WHERE id = ?", [content, id])
    }
};