// src/modules/property/property.routes.ts

import { Router } from "express";
import PropertyController from "./property.controller";
import { authMiddleware, verifyRole } from "../../middleware/auth.Middleware";
import { Role } from "@prisma/client";

const propertyRouter = Router();

propertyRouter.get("/", PropertyController.getProperty);
propertyRouter.get("/:id", PropertyController.getSingleProperty);

propertyRouter.post(
  "/create",
  authMiddleware,
  verifyRole([Role.HOST], "Only hosts can create properties"),
  PropertyController.createProperty
);

propertyRouter.get(
  "/owner/me",
  authMiddleware,
  verifyRole([Role.HOST, Role.ADMIN], "Only host or admin"),
  PropertyController.ownerProperty
);

propertyRouter.patch(
  "/update/:id",
  authMiddleware,
  verifyRole([Role.HOST], "Only host can update property"),
  PropertyController.updateProperty
);

propertyRouter.patch(
  "/delete/:id",
  authMiddleware,
  verifyRole([Role.HOST, Role.ADMIN], "Only host or admin"),
  PropertyController.deleteProperty
);

propertyRouter.patch(
  "/:id/status",
  authMiddleware,
  verifyRole([Role.HOST, Role.ADMIN], "Only host or admin"),
  PropertyController.ToggleStatus
);

export default propertyRouter;
