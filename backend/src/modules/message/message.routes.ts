import { Router } from "express";
import MessageController from "./message.controller";
import { authMiddleware } from "../../middleware/auth.Middleware";

const router = Router();
router.use(authMiddleware);

router.get("/conversations", MessageController.getConversations as any);
router.get("/history/:otherUserId", MessageController.getHistory as any);

export default router;
