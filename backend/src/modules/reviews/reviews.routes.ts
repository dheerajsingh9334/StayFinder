import { Router } from "express";
import { authMiddleware, verifyRole } from "../../middleware/auth.Middleware";
import reviewsControlller from "./reviews.controller";
import { Role } from "@prisma/client";

const reviewRouter = Router();

reviewRouter.post("/add", authMiddleware, reviewsControlller.addReviews);
reviewRouter.get("/property/:propertyId", reviewsControlller.propertyReviews);
reviewRouter.get("/me", authMiddleware, reviewsControlller.userReviews);
reviewRouter.patch(
  "/delete/:reviewId",
  authMiddleware,
  reviewsControlller.deleteReviews
);

reviewRouter.patch(
  "/edit/:reviewId",
  authMiddleware,
  reviewsControlller.editReviews
);

reviewRouter.patch(
  "/toggle/:reviewId",
  authMiddleware,
  verifyRole([Role.ADMIN], "only admin have this access"),
  reviewsControlller.toggleReviews
);

reviewRouter.patch(
  "/restore/:reviewId",
  authMiddleware,
  verifyRole([Role.ADMIN], "only admin have this access"),
  reviewsControlller.restorereview
);

export default reviewRouter;
