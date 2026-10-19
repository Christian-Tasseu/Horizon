import { journalService } from "../services/journal.service.js";

export const journalController = {
  async createJournal(req, res) {
    const userId = req.userId;
    const { content } = req.body;

    if (typeof content !== "string" || !content?.trim()) {
      return res.status(400).json({ error: "Le contenu est requis" });
    }

    try {
      const journalId = await journalService.createJournal({ userId, content });
      res.status(201).json({ id: journalId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    const userId = req.userId;

    try {
      const list = await journalService.list({ userId })
      res.status(200).json(list)
    } catch (error) {
      res.status(500).json({ error: error.message})
    }
  },

  async updateJournal(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const { content } = req.body

    if (typeof content !== "string" || !content?.trim()) {
      return res.status(400).json({ error: "Le contenu est requis" });
    }

    try {
      await journalService.updateJournal({ userId, id, content})
      res.status(204).send()
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message})
    }
  }
};
