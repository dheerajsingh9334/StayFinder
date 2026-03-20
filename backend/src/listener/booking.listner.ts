import { error } from "node:console";
import { BOOKING_EVENTS } from "../event/booking.event";
import eventBus from "../event/event";
import prisma from "../utils/dbconnect";
import { bookingQueue } from "../queue/booking.queue";
import { emailQueue } from "../queue/email.queue";

eventBus.on(BOOKING_EVENTS.CREATED, async ({ bookingId }) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        user: true,
      },
    });
    if (!booking) {
      return;
    }

    await emailQueue.add("booking-created-email", {
      booking,
    });

    await bookingQueue.add(
      "auto-cancle",
      { bookingId },
      {
        delay: 15 * 60 * 1000,
        jobId: `auto-cancle-${bookingId}`,
        removeOnComplete: true,
      },
    );

    const delay = new Date(booking.endDate).getTime() - Date.now();

    await bookingQueue.add(
      "auto-complete",
      { bookingId: bookingId },
      {
        delay,
        jobId: `auto-complete-${bookingId}`,
      },
    );
  } catch (error) {
    console.log(error);
  }
});

eventBus.on(BOOKING_EVENTS.CANCELLED, async ({ bookingId }) => {
  await emailQueue.add("booking-cancelled-email", { bookingId });
});

eventBus.on(BOOKING_EVENTS.CONFIRMED, async ({ bookingId }) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        user: true,
      },
    });
    console.log("🔥 BOOKING CONFIRMED EVENT");
    if (!booking) {
      return;
    }
    await emailQueue.add("booking-confirmed-email", { booking });

    console.log("Booking confirmation mail sent");
  } catch (error) {
    console.error("Booking listener error:", error);
  }
});

eventBus.on(BOOKING_EVENTS.COMPLETED, async ({ bookingId }) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        user: true,
      },
    });
    if (!booking) {
      return;
    }
    await emailQueue.add("booking-completed-email", { booking });

    console.log("Review email sent");
  } catch (error) {
    console.error("Review mail error:", error);
  }
});
