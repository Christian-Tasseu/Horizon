import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/ask", authMiddleware, chatController.ask);
router.post("/weekly-summary", authMiddleware, chatController.weeklySummary)

export default router;