import { db } from "../config/database.js";

export const habitLogRepository = {
  async upsertLog({ habitId, logDate, completed, note }) {
    await db.query(
      `INSERT INTO habit_logs (habit_id, log_date, completed, note)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE completed = VALUES(completed), note = VALUES(note)`,
      [habitId, logDate, completed, note],
    );
  },
  async removeLog({ habitId, logId }) {
    await db.query(
      "DELETE FROM habit_logs WHERE id = ? AND habit_id = ?",
      [logId, habitId],
    );
  },
  async findByHabit(habitId) {
    const [habitLogs] = await db.query("SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY log_date ASC", [habitId]);
    return habitLogs;
  }
};