import { habitService } from "../services/habit.service.js";

export const habitController = {
  async list(req, res) {
    const userId = req.userId;
    try {
      const habits = await habitService.list(userId);
      res.status(200).json(habits);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async create(req, res) {
    const userId = req.userId;
    const { name, description, frequency, color } = req.body;
    try {
      const habitId = await habitService.create({
        userId,
        name,
        description,
        frequency,
        color,
      });
      res.status(201).json({ id: habitId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async update(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    const { name, description, color } = req.body;
    if (name.trim() == "" || name.length > 150) {
      return res
        .status(400)
        .json({ error: "Le nom de l'habitude est absent ou exède la limite" });
    }
    try {
      await habitService.update({ id, userId, name, description, color });
      res.status(204).send();
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  async archive(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    try {
      await habitService.archive({ id, userId });
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
  async listArchived(req, res) {
    const userdId = req.userId;
    try {
      const archived = await habitService.listArchived(userdId);
      res.status(200).json(archived);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async restore(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    try {
      await habitService.restore({ id, userId });
      res.status(204).send();
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  async logHabit(req, res) {
    const userId = req.userId;
    const { habitId } = req.params;
    const { logDate, completed, note } = req.body;
    try {
      await habitService.logHabit({
        habitId,
        userId,
        logDate,
        completed,
        note,
      });
      res.status(200).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
  async removeLog(req, res) {
    const userId = req.userId;
    const { habitId, logId } = req.params;
    try {
      await habitService.removeLog({ habitId, logId, userId });
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
  async getLogs(req, res) {
    const userId = req.userId;
    const { habitId } = req.params;
    try {
      const logs = await habitService.getLogs({ habitId, userId });
      res.status(200).json(logs);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};
