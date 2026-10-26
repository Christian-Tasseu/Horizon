import { habitRepository } from "../repositories/habit.repository.js";
import { habitLogRepository } from "../repositories/habitLog.repository.js";

export const habitService = {
  async list(userId) {
    return await habitRepository.findAllByUser(userId);
  },
  async create({ userId, name, description, frequency, color }) {
    return await habitRepository.create({
      userId,
      name,
      description,
      frequency,
      color,
    });
  },
  async update({ id, userId, name, description, color }) {
    const habit = await habitRepository.findById(id);
    if (!habit) throw new Error("Habitude introuvable");
    if (habit.user_id !== userId) throw new Error("Habitude introuvable");
    await habitRepository.update({ id, name, description, color });
  },
  async archive({ id, userId }) {
    const habit = await habitRepository.findById(id);
    if (!habit) throw new Error("Habitude introuvable");
    if (habit.user_id !== userId) throw new Error("Habitude introuvable");
    await habitRepository.archive(id);
  },
  async listArchived(userId) {
    const archived = await habitRepository.findArchivedByUser(userId);
    return archived
  },
  async restore({ id, userId }) {
    const habit = await habitRepository.findById(id);
    if (!habit) throw new Error("Habitude introuvable");
    if (habit.user_id !== userId) throw new Error("Habitude introuvable");
    await habitRepository.restore(id);
  },
  async logHabit({ habitId, userId, logDate, completed, note }) {
    const habit = await habitRepository.findById(habitId);
    if (!habit) throw new Error("Habitude introuvable");
    if (habit.user_id !== userId) throw new Error("Habitude introuvable");
    await habitLogRepository.upsertLog({ habitId, logDate, completed, note });
  },
  async removeLog({ habitId, logId, userId }) {
    const habit = await habitRepository.findById(habitId);
    if (!habit) throw new Error("Habitude introuvable");
    if (habit.user_id !== userId) throw new Error("Habitude introuvable");
    await habitLogRepository.removeLog({ habitId, logId });
  },
  async getLogs({ habitId, userId }) {
    const habit = await habitRepository.findById(habitId);
    if (!habit) throw new Error("Habitude introuvable");
    if (habit.user_id !== userId) throw new Error("Habitude introuvable");
    return await habitLogRepository.findByHabit(habitId);
  },
};
