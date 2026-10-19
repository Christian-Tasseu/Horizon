import { journalRepository } from "../repositories/journal.repository.js";

export const journalService = {
  async createJournal({ userId, content }) {
    return await journalRepository.createJournal({
      userId: userId,
      content: content,
    });
  },

  async list({ userId }) {
    return await journalRepository.findAllByUser({ userId: userId });
  },

  async updateJournal({ userId, id, content }) {
    const entry = await journalRepository.findById({ id })
    if (entry?.user_id !== userId) {
      const error = new Error("Entrée introuvable");
      error.status = 404;
      throw error;
    }
    await journalRepository.updateJournal({ id, content });
  },
};
