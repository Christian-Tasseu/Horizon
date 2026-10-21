import { journalRepository } from "../repositories/journal.repository.js";
import { embeddingService } from "./embedding.service.js";
import { distance } from "../utils/vector.js";

const MAX_DISTANCE = 1.1;

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
    const entry = await journalRepository.findById({ id });
    if (entry?.user_id !== userId) {
      const error = new Error("Entrée introuvable");
      error.status = 404;
      throw error;
    }
    await journalRepository.updateJournal({ id, content });
    await refreshEmbedding(id, content);
  },

  async search({ userId, query }) {
    const distArray = [];
    const vecQuery = await embeddingService.embed(query);
    const entries = await journalRepository.findAllWithEmbedding({ userId });
    for (const entry of entries) {
      const distEQ = distance(entry.embedding, vecQuery);
      distArray.push({
        id: entry.id,
        content: entry.content,
        created_at: entry.created_at,
        distance: distEQ,
      });
    }
    return distArray
      .sort((a, b) => a.distance - b.distance)
      .filter((entry) => entry.distance <= MAX_DISTANCE)
      .slice(0, 5);
  },
};

const refreshEmbedding = async (id, content) => {
  try {
    const embedding = await embeddingService.embed(content);
    await journalRepository.saveEmbedding({ id, embedding });
  } catch (error) {
    console.error(id, error.message);
  }
};
