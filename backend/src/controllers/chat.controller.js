import { ragService } from "../services/rag.service.js";
import { summaryService } from "../services/summary.service.js";

export const chatController = {
  async ask(req, res) {
    const { question } = req.body;
    const userId = req.userId;
    if (typeof question !== "string" || !question?.trim()) {
      return res.status(400).json({ error: "La question est requise" });
    }
    try {
      const result = await ragService.answer({
        userId: userId,
        question,
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        error: "Une erreur est survenue lors du traitement de la requête.",
      });
    }
  },
  async weeklySummary(req, res) {
    const userId = req.userId;
    try {
      const {answer, sources} = await summaryService.summarizeWeek({ userId });
      res.status(200).json({ answer, sources})
    } catch (error) {
      res.status(error.status || 500).json({
        error: "Une erreur est survenue lors du traitement de la requête.",
      });
    }
  }
};
