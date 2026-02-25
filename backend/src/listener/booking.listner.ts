import { BOOKING_EVENTS } from "../event/booking.event";
import eventBus from "../event/event";
import { sendEmail } from "../services/email.service";
import prisma from "../utils/dbconnect";

eventBus.on(BOOKING_EVENTS.CREATED, (data) => {
  console.log("payment success Event", data);
});

eventBus.on(BOOKING_EVENTS.CANCELLED, (data) => {
  console.log("payment Cancled Event", data);
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
    if (!booking) {
      return;
    }
    await sendEmail({
      to: booking.user.email,
      subject: "Booking Confiremd",
      html: `  <h2>Your Booking is Confirmed</h2>
        <p>Location: ${booking.property.title}</p>
        <p>City: ${booking.property.city}</p>
        <p>From: ${booking.startDate.toDateString()}</p>
        <p>To: ${booking.endDate.toDateString()}</p>
        <p>Total: ₹${booking.totalPrice}</p>
    `,
    });
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
    await sendEmail({
      to: booking.user.email,
      subject: "how was your stay",
      html: `
       <h2>Your Booking is completed 🎉</h2>
        <p>Location: ${booking.property.title}, ${booking.property.city}</p>
        <p>We hope you had a great experience.</p>
        <p>Please share your review and help other users.</p>
        <a href="https://.com/review/${booking.id}">
          Write Review
        </a>
      `,
    });

    console.log("Review email sent");
  } catch (error) {
    console.error("Review mail error:", error);
  }
});
