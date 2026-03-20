import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import eventBus from "../event/event";
import { PAYMENT_EVENTS } from "../event/payment.event";
import { BOOKING_EVENTS } from "../event/booking.event";

console.log("💰 PAYMENT WORKER STARTED");

new Worker(
  "paymentQueue",
  async (job) => {
    console.log("🔥 PAYMENT JOB:", job.name);

    switch (job.name) {
      case "payment-success": {
        const { bookingId, userId, paymentId, amount } = job.data;

        eventBus.emit(PAYMENT_EVENTS.SUCCESS, {
          bookingId,
          userId,
          paymentId,
          amount,
        });

        eventBus.emit(BOOKING_EVENTS.CONFIRMED, {
          bookingId,
          userId,
        });

        break;
      }

      case "payment-failed": {
        const { bookingId, userId, reason } = job.data;

        eventBus.emit(PAYMENT_EVENTS.FAILED, {
          bookingId,
          userId,
          reason,
        });

        break;
      }
    }
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
  },
);
