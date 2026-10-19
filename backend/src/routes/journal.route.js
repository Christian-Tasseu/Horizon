import { Router } from "express"
import { journalController } from "../controllers/journal.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, journalController.createJournal)
router.get("/", authMiddleware, journalController.list)
router.patch("/:id", authMiddleware, journalController.updateJournal)

export default router; 