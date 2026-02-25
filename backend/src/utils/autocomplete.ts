import { BookingStatus } from "@prisma/client";
import prisma from "./dbconnect";
import eventBus from "../event/event";
import { BOOKING_EVENTS } from "../event/booking.event";

export const autoCompleteBooking = async () => {
  const now = new Date();

  const booking = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      endDate: {
        lt: now,
      },
    },
    select: { id: true, userId: true },
  });
  await prisma.booking.updateMany({
    where: { id: { in: booking.map((b) => b.id) } },
    data: { status: BookingStatus.COMPLETED },
  });
  for (const b of booking) {
    eventBus.emit(BOOKING_EVENTS.COMPLETED, {
      bookingId: b.id,
      userId: b.userId,
    });
  }

  console.log("auto completed called");
};
