import { conversationService } from "../services/conversation.service.js";
import { ragService } from "../services/rag.service.js";
import { summaryService } from "../services/summary.service.js";

export const chatController = {
  async ask(req, res) {
    const { question, conversationId } = req.body;
    const userId = req.userId;
    if (typeof question !== "string" || !question?.trim()) {
      return res.status(400).json({ error: "La question est requise" });
    }
    if (question.length > 1000) {
      return res.status(400).json({
        error: "La question ne doit pas dépasser 1000 caractères.",
      });
    }
    if (conversationId !== undefined && !Number.isInteger(conversationId)) {
      return res.status(400).json({
        error: "conversationId doit être un entier.",
      });
    }
    try {
      const result = await ragService.answer({
        userId: userId,
        conversationId,
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
    const { conversationId } = req.body;
    try {
      const result = await summaryService.summarizeWeek({
        userId,
        conversationId,
      });
      res.status(200).json({ result });
    } catch (error) {
      res.status(error.status || 500).json({
        error: "Une erreur est survenue lors du traitement de la requête.",
      });
    }
  },
  async getConversations(req, res) {
    const userId = req.userId;
    try {
      const conversations = await conversationService.list(userId);
      res.status(200).json({ conversations });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message,
      });
    }
  },
  async getMessages(req, res) {
    const userId = req.userId;
    const { conversationId } = req.params;
    try {
      const messages = await conversationService.getMessages({
        userId,
        conversationId: Number(id),
      });
      res.status(200).json({ messages });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message,
      });
    }
  },
};
