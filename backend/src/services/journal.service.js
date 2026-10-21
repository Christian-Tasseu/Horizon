import { journalRepository } from "../repositories/journal.repository.js";
import { embeddingService } from "./embedding.service.js";

export const journalService = {
  async createJournal({ userId, content }) {
    const insertId = await journalRepository.createJournal({
      userId: userId,
      content: content,
    });
    await refreshEmbedding(insertId, content);
    return insertId;
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
    await refreshEmbedding(id, content);
  },
};

const refreshEmbedding = async (id, content) => {
  try {
    const embedding = await embeddingService.embed(content);
    await journalRepository.saveEmbedding({id, embedding})
  } catch (error) {
    console.error(id, error.message);
  }
};