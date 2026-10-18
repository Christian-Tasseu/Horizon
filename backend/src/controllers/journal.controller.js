import { journalService } from "../services/journal.service.js";

export const journalController = {
  async createJournal(req, res) {
    const userId = req.userId;
    const { content } = req.body;

    try {
      if (typeof content !== "string" || !content?.trim()) {
        return res.status(400).json({ error: "Le contenu est requis" });
      }
      const journalId = await journalService.createJournal({ userId, content });
      res.status(201).json({ id: journalId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
