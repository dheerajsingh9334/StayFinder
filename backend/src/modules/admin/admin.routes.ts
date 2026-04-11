import { Router } from "express";
import AdminController from "./admin.controller";
import { authMiddleware } from "../../middleware/auth.Middleware";

const router = Router();
router.use(authMiddleware);

router.get("/users", AdminController.getUsers as any);
router.patch("/users/:id/ban", AdminController.toggleBan as any);
router.patch("/users/:id/verify", AdminController.verifyUser as any);
router.patch("/properties/:id/status", AdminController.updatePropertyStatus as any);

export default router;
