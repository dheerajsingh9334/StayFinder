import { Request, Response } from "express";
import crypto from "crypto";

import { BookingStatus, PaymentStatus } from "@prisma/client";
import prisma from "../utils/dbconnect";

export default class PaymentWebhook {
  static handle = async (req: Request, res: Response) => {
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

    if (event === "payment.captured") {
      const payment = payload.payment.entity;
      const bookingId = payment.notes?.receipt;

      await prisma.$transaction([
        prisma.payment.create({
          data: {
            bookingId,
            amount: payment.amount / 100,
            provider: "RAZORPAY",
            providerPaymentId: payment.id,
            status: PaymentStatus.SUCCESS,
            userId: payment.notes.userId,
          },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CONFIRMED },
        }),
      ]);
    }

    if (event === "payment.failed") {
      const payment = payload.payment.entity;
      const bookingId = payment.notes?.receipt;

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });
    }

    return res.json({ status: "ok" });
  };
}
