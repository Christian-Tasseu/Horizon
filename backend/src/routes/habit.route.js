import { Router } from "express";
import { habitController } from "../controllers/habit.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Habits routes
router.get("/", authMiddleware, habitController.list);
router.post("/", authMiddleware, habitController.create);
router.patch("/:id", authMiddleware, habitController.update)
router.patch("/:id/archive", authMiddleware, habitController.archive);
router.get("/archived", authMiddleware, habitController.listArchived)
router.patch("/:id/restore", authMiddleware, habitController.restore)
router.post("/:habitId/logs", authMiddleware, habitController.logHabit);
router.delete("/:habitId/logs/:logId", authMiddleware, habitController.removeLog);
router.get("/:habitId/logs", authMiddleware, habitController.getLogs);

export default router;