import { db } from "../config/database.js";

export const habitRepository = {
  async findAllByUser(userId) {
    const [habits] = await db.query(
      "SELECT * FROM habits WHERE user_id = ? AND archived_at IS NULL",
      [userId],
    );
    return habits;
  },
  async create({ userId, name, description, frequency, color }) {
    const [habit] = await db.query(
      "INSERT INTO habits (user_id, name, description, frequency, color) VALUES (?, ?, ?, ?, ?)",
      [userId, name, description, frequency, color],
    );
    return habit.insertId;
  },
  async archive(id) {
    await db.query("UPDATE habits SET archived_at = NOW () WHERE id = ?", [id]);
  },
  async findById(id) {
    const [habit] = await db.query("SELECT * FROM habits WHERE id = ?", [id]);
    return habit[0] || null;
  },
};
