import { Router } from "express";
import availabilityController from "./availability.controller";
import { authMiddleware, verifyRole } from "../../middleware/auth.Middleware";
import { Role } from "@prisma/client";

const availabilityRouter = Router();

availabilityRouter.post(
  "/block",
  authMiddleware,
  verifyRole(
    [Role.HOST, Role.ADMIN],
    "Only host or admin can block availability"
  ),
  availabilityController.blockTime
);
availabilityRouter.delete(
  "/unblock/:blockId",
  authMiddleware,
  verifyRole(
    [Role.HOST, Role.ADMIN],
    "Only host or admin can block availability"
  ),
  availabilityController.unblockTime
);

availabilityRouter.get(
  "/:propertyId",
  authMiddleware,
  verifyRole(
    [Role.HOST, Role.ADMIN],
    "Only host or admin can block availability"
  ),
  availabilityController.getHostBlock
);

availabilityRouter.get(
  "/property/:propertyId/calender",
  availabilityController.getCalenderView
);

availabilityRouter.get(
  "/property/:propertyId/availability",
  availabilityController.bookingAvailability
);
export default availabilityRouter;
