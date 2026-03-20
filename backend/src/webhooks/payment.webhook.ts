import { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../utils/dbconnect";
import { BookingStatus } from "@prisma/client";
import { redisClient } from "../config/redis";
import { paymentQueue } from "../queue/payment.queue";

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
        return res.status(400).json({ msg: "Invalid signature" });
      }

      const event = req.body.event;
      const payment = req.body.payload.payment.entity;

      const bookingId = payment.notes?.bookingId;
      const userId = payment.notes?.userId;
      const orderId = payment.order_id;

      if (!bookingId || !userId || !orderId) {
        return res.status(400).json({ msg: "Invalid metadata" });
      }

      // 🔒 idempotency
      const key = `payment:webhook:${payment.id}`;
      const exists = await redisClient.get(key);
      if (exists) return res.json({ msg: "Already processed" });

      await redisClient.set(key, "done", "EX", 600);

      console.log("🚀 WEBHOOK HIT:", event);

      if (event === "payment.captured") {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { orderId },
            data: {
              providerPaymentId: payment.id,
              status: "SUCCESS",
              rawWebhook: req.body,
            },
          });

          await tx.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.CONFIRMED },
          });
        });

        // 🔥 QUEUE ADD
        console.log("🚀 ADDING PAYMENT JOB");

        // await paymentQueue.add("payment-success", {...});
        await paymentQueue.add(
          "payment-success",
          {
            paymentId: payment.id,
            bookingId,
            userId,
            amount: payment.amount / 100,
          },
          {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
          },
        );
      }

      if (event === "payment.failed") {
        await prisma.payment.update({
          where: { orderId },
          data: {
            status: "FAILED",
            failureReason: payment.error_description,
            rawWebhook: req.body,
          },
        });

        // 🔥 QUEUE ADD
        await paymentQueue.add("payment-failed", {
          paymentId: payment.id,
          bookingId,
          userId,
          reason: payment.error_description,
        });
      }

      return res.json({ status: "ok" });
    } catch (err) {
      console.error("Webhook error:", err);
      return res.status(500).json({ msg: "Server error" });
    }
  };
}
