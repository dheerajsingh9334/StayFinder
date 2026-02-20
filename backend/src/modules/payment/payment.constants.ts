import { response } from "express";
import { AuthRequest } from "../auth/auth.types";
import prisma from "../../utils/dbconnect";

export default class PaymentController {
  static createPayment = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
    const { bookingId } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking)
      return res.status(404).json({
        msg: "Booking not Found",
      });

    const PaymentIntent = await Str;
  };
}
