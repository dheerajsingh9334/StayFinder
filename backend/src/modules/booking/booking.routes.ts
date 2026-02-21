import { Router } from "express";
import { authMiddleware, verifyRole } from "../../middleware/auth.Middleware";
import { verify } from "crypto";
import { Role } from "@prisma/client";
import bookingController from "./booking.controller";

const bookingRouter = Router();

bookingRouter.post("/create", authMiddleware, bookingController.createBooking);
bookingRouter.get(
  "/getBooking/:propertyId",
  authMiddleware,
  verifyRole(
    [Role.ADMIN, Role.HOST],
    "Only admin and Host can access this routes",
  ),
  bookingController.getPropertyaBooking,
);
bookingRouter.get(
  "/my-booking",
  authMiddleware,
  bookingController.getUserBooking,
);

// bookingRouter.patch(
//   "/toogle/:bookingId",
//   authMiddleware,
//   verifyRole(
//     [Role.ADMIN, Role.HOST],
//     "Only admin and Host can access this routes"
//   ),
//   bookingController.toggleBooking
// );

bookingRouter.patch(
  "/cancle/:bookingId",
  authMiddleware,
  bookingController.cancelBooking,
);

bookingRouter.patch(
  "/Complete/:bookingId",
  authMiddleware,
  verifyRole([Role.ADMIN, Role.HOST], "Only admin and host can do that"),
  bookingController.cancelBooking,
);
export default bookingRouter;
