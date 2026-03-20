import eventBus from "../event/event";
import { PAYMENT_EVENTS } from "../event/payment.event";
import { emailQueue } from "../queue/email.queue";
import prisma from "../utils/dbconnect";

// ✅ SUCCESS
eventBus.on(PAYMENT_EVENTS.SUCCESS, async ({ bookingId, amount }) => {
  console.log("🔥 PAYMENT SUCCESS LISTENER HIT");
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, property: true },
  });

  if (!booking) return;

  await emailQueue.add("payment-success-email", {
    email: booking.user.email,
    booking,
    amount,
  });

  console.log("✅ Payment success email queued");
});

// ❌ FAILED
eventBus.on(PAYMENT_EVENTS.FAILED, async ({ bookingId, reason }) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, property: true },
  });

  if (!booking) return;

  await emailQueue.add("payment-failed-email", {
    email: booking.user.email,
    booking,
    reason,
  });

  console.log("❌ Payment failed email queued");
});
