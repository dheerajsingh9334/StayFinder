import { AuthRequest } from "../auth/auth.types";
import prisma from "../../utils/dbconnect";
import razorpay from "../../services/razorpay.service";
import { Response } from "express";

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

    const PaymentIntent = await razorpay.orders.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: "INR",
      receipt: bookingId,
    });
    return res.status(200).json({
      msg: "Order Success",
      orderId: PaymentIntent.id,
      amount: PaymentIntent.amount,
      currncy: PaymentIntent.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  };
}
