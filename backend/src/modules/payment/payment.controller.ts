import { AuthRequest } from "../auth/auth.types";
import prisma from "../../utils/dbconnect";
import razorpay from "../../services/razorpay.service";
import { Response } from "express";

export default class PaymentController {
  static createPayment = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
      const { bookingId } = req.body;
      const userId = req.user.userId;
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking)
        return res.status(404).json({
          msg: "Booking not Found",
        });

      const order = await razorpay.orders.create({
        amount: Math.round(booking.totalPrice * 100),
        currency: "INR",
        receipt: booking.id,
        notes: {
          bookingId: booking.id,
          userId: userId,
        },
      });
      return res.status(200).json({
        msg: "Order Success",
        orderId: order.id,
        amount: order.amount,
        currncy: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } catch (err: any) {
      console.error("RAZORPAY ERROR:", err);
      return res.status(500).json({
        msg: "Razorpay error",
        error: err?.error || err,
      });
    }
  };
}
