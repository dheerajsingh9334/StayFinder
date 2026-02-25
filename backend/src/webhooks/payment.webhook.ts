import { Request, Response } from "express";
import crypto from "crypto";

import { BookingStatus, PaymentStatus } from "@prisma/client";
import prisma from "../utils/dbconnect";
import { PAYMENT_EVENTS } from "../event/payment.event";
import eventBus from "../event/event";
import { BOOKING_EVENTS } from "../event/booking.event";

export default class PaymentWebhook {
  static handle = async (req: Request, res: Response) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

      const signature = req.headers["x-razorpay-signature"] as string;
      const body = JSON.stringify(req.body);

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        return res.status(400).json({ msg: "Invalid webhook signature" });
      }

      const event = req.body.event;
      const payload = req.body.payload;
      console.log("WEBHOOK HIT", req.body.event);
      if (event === "payment.captured") {
        const payment = payload.payment.entity;
        const bookingId = payment.notes?.bookingId;
        const userId = payment.notes?.userId;
        console.log("NOTES:", payment.notes);
        if (!bookingId || !userId) {
          return res.status(400).json({
            msg: "Invalid metadata",
          });
        }
        const existingPayment = await prisma.payment.findFirst({
          where: { providerPaymentId: payment.id },
        });

        if (existingPayment) {
          return res.json({
            msg: "Already Proceed",
          });
        }
        await prisma.$transaction(async (tx) => {
          const createdPayment = await tx.payment.create({
            data: {
              bookingId,
              amount: payment.amount / 100,
              provider: "RAZORPAY",
              providerPaymentId: payment.id,
              status: PaymentStatus.SUCCESS,
              userId,
            },
          });
          console.log("NOTES:", payment.notes);

          await tx.booking.update({
            where: { id: bookingId },
            data: {
              status: BookingStatus.CONFIRMED,
              paymentId: createdPayment.id, // ⭐ IMPORTANT
            },
          });
        });
        console.log("BOOKING ID:", bookingId);
        eventBus.emit(PAYMENT_EVENTS.SUCCESS, {
          bookingId,
          userId,
        });
        eventBus.emit(BOOKING_EVENTS.CONFIRMED, {
          bookingId,
          userId,
        });
      }

      if (event === "payment.failed") {
        const payment = payload.payment.entity;
        const bookingId = payment.notes?.receipt;

        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CANCELLED },
        });
        eventBus.emit(PAYMENT_EVENTS.FAILED, {
          bookingId,
        });
      }

      return res.json({ status: "ok" });
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };
}
