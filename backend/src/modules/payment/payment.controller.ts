import { AuthRequest } from "../auth/auth.types";
import prisma from "../../utils/dbconnect";
import razorpay from "../../services/razorpay.service";
import { Response } from "express";
import eventBus from "../../event/event";
import { BOOKING_EVENTS } from "../../event/booking.event";
import { hostname } from "node:os";

export default class PaymentController {
  static createPayment = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
      const { bookingId } = req.body;
      const userId = req.user.userId;
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });
      console.log("paymet are  called");

      if (!booking)
        return res.status(404).json({
          msg: "Booking not Found",
        });

      if (booking.userId !== userId) {
        return res.status(403).json({ msg: "Not allowed" });
      }

      if (booking.status !== "PENDING_PAYMENT") {
        return res.status(403).json({ msg: "Booking already paid or invalid" });
      }
      const existingPaymentInitiated = await prisma.payment.findFirst({
        where: {
          bookingId,
          status: "INITIATED",
        },
      });
      if (existingPaymentInitiated) {
        return res.status(400).json({
          msg: "Payment already initiated",
        });
      }
      const order = await razorpay.orders.create({
        amount: Math.round(booking.totalPrice * 100),
        currency: "INR",
        receipt: booking.id,
        notes: {
          bookingId: booking.id,
          userId: userId,
        },
      });
      await prisma.payment.create({
        data: {
          userId,
          bookingId: booking.id,
          orderId: order.id,
          amount: booking.totalPrice,
          provider: "RAZORPAY",
          providerPaymentId: "",
          status: "INITIATED",
        },
      });
      eventBus.emit("BOOKING_CONFIRMED", {
        bookingId: booking.id,

        userId: req.user.userId,
        amount: booking.totalPrice,
      });
      return res.status(200).json({
        msg: "Order Success",
        orderId: order.id,
        amount: order.amount,
        currncy: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        // status: order.status,
      });
    } catch (err: any) {
      console.error("RAZORPAY ERROR:", err);
      return res.status(500).json({
        msg: "Payment initialization error",
        error: err?.error || err,
      });
    }
  };
}
