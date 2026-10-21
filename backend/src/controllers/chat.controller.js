import { ragService } from "../services/rag.service.js";

export const chatController = {
  async ask(req, res) {
    try {
      const { question } = req.body;
      if (typeof question !== "string" || !question?.trim()) {
        return res.status(400).json({ error: "La question est requise" });
      }
      const result = await ragService.answer({
        userId: req.userId,
        question,
      });
      res.status(200).json(result);
    } catch (error) {
      res
        .status(error.status || 500)
        .json({
          error: "Une erreur est survenue lors du traitement de la requête.",
        });
    }
  },
};
