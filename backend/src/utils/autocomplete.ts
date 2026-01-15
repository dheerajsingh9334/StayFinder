import { BookingStatus } from "@prisma/client";
import prisma from "./dbconnect";

export const autoCompleteBooking = async () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  await prisma.booking.updateMany({
    where: {
      status: BookingStatus.CONFIRMED,
      endDate: {
        lt: now,
      },
    },
    data: {
      status: BookingStatus.COMPLETED,
    },
  });
};
