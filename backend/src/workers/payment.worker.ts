import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { bullmqConnection } from "../config/redis";
import prisma from "../utils/dbconnect";
import { emailQueue } from "../queue/email.queue";

console.log("💰 PAYMENT WORKER STARTED");

new Worker(
  "paymentQueue",
  async (job) => {
    console.log("🔥 PAYMENT JOB:", job.name);

    switch (job.name) {
      case "payment-success": {
        const { bookingId, paymentId, amount } = job.data;

        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { user: true, property: true },
        });

        if (!booking) {
          break;
        }

        await emailQueue.add("payment-success-email", {
          email: booking.user.email,
          booking,
          amount,
          paymentId,
        });

        await emailQueue.add("booking-confirmed-email", {
          booking,
        });

        console.log("✅ Payment success flow queued", {
          bookingId,
          paymentId,
        });

        break;
      }

      case "payment-failed": {
        const { bookingId, reason, paymentId } = job.data;

        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { user: true, property: true },
        });

        if (!booking) {
          break;
        }

        await emailQueue.add("payment-failed-email", {
          email: booking.user.email,
          booking,
          bookingId,
          reason,
          paymentId,
        });

        console.log("✅ Payment failed flow queued", {
          bookingId,
          paymentId,
        });

        break;
      }
    }
  },
  {
    connection: bullmqConnection,
  },
);
