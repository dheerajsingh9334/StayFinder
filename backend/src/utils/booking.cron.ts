import { BookingStatus } from "@prisma/client";
import prisma from "./dbconnect";

export const cancleExpireBooking = async () => {
  const expiry = new Date(Date.now() - 15 * 60 * 1000);
  await prisma.booking.updateMany({
    where: {
      status: BookingStatus.PENDING_PAYMENT,
      createdAt: { lt: expiry },
    },
    data: { status: BookingStatus.CANCELLED },
  });
};
