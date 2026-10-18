import { Router } from "express"
import { journalController } from "../controllers/journal.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, journalController.createJournal)

export default router; 