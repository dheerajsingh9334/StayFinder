import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.Middleware";
import PropertyController from "../property/property.controller";
import FavoriteController from "./favorite.controller";

const faviroteRouter = Router();

faviroteRouter.post(
  "/add/:propertyId",
  authMiddleware,
  FavoriteController.addFavorite
);

faviroteRouter.get("/my", authMiddleware, FavoriteController.myFavorite);

faviroteRouter.delete(
  "/remove/:propertyId",
  authMiddleware,
  FavoriteController.removeFavorite
);

export default faviroteRouter;
