import { AuthRequest } from "../auth/auth.types";
import prisma from "../../utils/dbconnect";
import razorpay from "../../services/razorpay.service";
import { Response } from "express";
import { redisClient } from "../../config/redis";

export default class PaymentController {
  static createPayment = async (req: AuthRequest, res: Response) => {
    let lockKey = "";
    try {
      console.log("PAYMENT API HIT");
      if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
      const { bookingId } = req.body;
      const userId = req.user.userId;

      const idempotencyKey = req.headers["idempotency-key"] as string;

      if (!idempotencyKey) {
        return res.status(400).json({
          msg: "missing idempotency key",
        });
      }

      const existinResponse = await redisClient.get(
        `payment:idempotency:${idempotencyKey}`,
      );

      if (existinResponse) {
        return res.status(200).json(JSON.parse(existinResponse));
      }
      lockKey = `lock:payment:${bookingId}`;
      const lock = await redisClient.set(lockKey, "locked", "PX", 10000, "NX");
      if (!lock) {
        return res.status(429).json({
          msg: "Payment already in progress",
        });
      }

      if (!bookingId)
        return res.status(404).json({
          msg: "Booking not Found",
        });

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
        return res.status(200).json({
          msg: "Existing payment",
          orderId: existingPaymentInitiated.orderId,
          amount: existingPaymentInitiated.amount * 100,
          currency: "INR",
          key: process.env.RAZORPAY_KEY_ID,
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
          // providerPaymentId: null,
          status: "INITIATED",
        },
      });

      const responseData = {
        msg: "Order Success",
        orderId: order.id,
        amount: order.amount,
        currncy: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        // status: order.status,
      };

      await redisClient.set(
        `payment:idempotency:${idempotencyKey}`,
        JSON.stringify(responseData),
        "EX",
        300,
      );

      return res.status(200).json(responseData);
    } catch (err: any) {
      console.error("RAZORPAY ERROR:", err);
      return res.status(500).json({
        msg: "Payment initialization error",
        error: err?.error || err,
      });
    } finally {
      if (lockKey) {
        await redisClient.del(lockKey);
      }
    }
  };
  static getMyPayments = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
      const payments = await prisma.payment.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            include: {
              property: { select: { id: true, title: true, city: true, images: true } }
            }
          }
        }
      });
      return res.status(200).json({ payments });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Server Error" });
    }
  };
}
