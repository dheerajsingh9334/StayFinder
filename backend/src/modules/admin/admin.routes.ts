import { Router } from "express";
import AdminController from "./admin.controller";
import { authMiddleware } from "../../middleware/auth.Middleware";

const router = Router();
router.use(authMiddleware);

router.get("/users", AdminController.getUsers as any);
router.post("/users", AdminController.createUser as any);
router.get("/properties", AdminController.getProperties as any);
router.patch("/users/:id/ban", AdminController.toggleBan as any);
router.patch("/users/:id/verify", AdminController.verifyUser as any);
router.patch("/properties/:id/status", AdminController.updatePropertyStatus as any);
router.get("/bookings", AdminController.getBookings as any);
router.get("/payments", AdminController.getPayments as any);
router.get("/reviews", AdminController.getReviews as any);
router.delete("/reviews/:id", AdminController.deleteReview as any);

export default router;
