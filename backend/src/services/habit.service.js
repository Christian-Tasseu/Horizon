import {habitRepository} from "../repositories/habit.repository.js";
import {habitLogRepository} from "../repositories/habitLog.repository.js";

export const habitService = {
    async list(userId) {
        return await habitRepository.findAllByUser(userId);
    },
    async create({userId, name, description, frequency, color}) {
        return await habitRepository.create({userId, name, description, frequency, color});
    },
    async archive({id, userId}) {
        const habit = await habitRepository.findById(id);
        if (!habit) throw new Error("Habitude introuvable");
        if (habit.user_id !== userId) throw new Error("Habitude introuvable");
        await habitRepository.archive(id);
    },
    async logHabit({ habitId, userId, logDate, completed, note})  {
        const habit = await habitRepository.findById(habitId);
        if(!habit) throw new Error("Habitude introuvable");
        if(habit.user_id !== userId) throw new Error("Habitude introuvable");
        await habitLogRepository.upsertLog({ habitId, logDate, completed, note });
    },
    async getLogs({ habitId, userId }) {
        const habit = await habitRepository.findById(habitId);
        if (!habit) throw new Error("Habitude introuvable");
        if (habit.user_id !== userId) throw new Error("Habitude introuvable");
        return await habitLogRepository.findByHabit(habitId);
    }
}