import { Worker } from "bullmq";
import { bullmqConnection } from "../config/redis";
import prisma from "../utils/dbconnect";
import eventBus from "../event/event";
import { bookingQueue } from "../queue/booking.queue";

async function scheduleRecoveryJob() {
  await bookingQueue.add(
    "recovery-job",
    {},
    {
      jobId: "booking-recovery-job",
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
}

scheduleRecoveryJob().catch((error) => {
  console.error("Failed to schedule recovery job:", error);
});

new Worker(
  "bookingQueue",
  async (job) => {
    switch (job.name) {
      case "auto-cancle": {
        const { bookingId } = job.data;
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
        });
        if (booking?.status === "PENDING_PAYMENT") {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" },
          });
          eventBus.emit("BOOKING_CANCELLED", { bookingId });
        }
        break;
      }
      case "auto-complete": {
        const { bookingId } = job.data;
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "COMPLETED" },
        });
        eventBus.emit("BOOKING_COMPLETED", { bookingId });
        break;
      }
      case "recovery-job": {
        console.log("Recovery job runnig");
        const now = new Date();
        const pendingBooking = await prisma.booking.findMany({
          where: {
            status: "PENDING_PAYMENT",
            createdAt: {
              lt: new Date(Date.now() - 15 * 60 * 1000),
            },
          },
        });

        for (const b of pendingBooking) {
          await bookingQueue.add("auto-cancle", {
            bookingId: b.id,
          });
        }

        const completeBooking = await prisma.booking.findMany({
          where: {
            status: "CONFIRMED",
            endDate: {
              lt: now,
            },
          },
        });
        for (const b of completeBooking) {
          await bookingQueue.add("auto-complete", {
            bookingId: b.id,
          });
        }
        console.log("Done");
        break;
      }
    }
  },
  {
    connection: bullmqConnection,
  },
);
