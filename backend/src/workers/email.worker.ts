import dotenv from "dotenv";
dotenv.config();
import { Worker } from "bullmq";
import { bullmqConnection } from "../config/redis";
import { sendEmail } from "../services/email.service";
console.log("email worker start");
new Worker(
  "emailQueue",
  async (job) => {
    switch (job.name) {
      case "booking-created-email": {
        const { booking } = job.data;
        const url = `https://stay-finder-blue.vercel.app/booking/${booking.id}`;
        await sendEmail({
          to: booking.user.email,
          subject: "Booking Created please pay",
          html: `
            <h2>Your Booking is Created</h2>
            <p>${booking.property.title}</p>
            <p>${booking.startDate}</p>
                    <a href="${url}">pay now</a>
          `,
          replyTo: booking.property.email || "support@stayfinder.com",
        });
        break;
      }

      case "host-new-booking-email": {
        const { booking } = job.data;
        await sendEmail({
          to: booking.property.owner.email,
          subject: "New Booking Request",
          html: `
            <h2>You have a new booking request</h2>
            <p>Property: ${booking.property.title}</p>
            <p>Guest: ${booking.user.name}</p>
            <p>Dates: ${booking.startDate} to ${booking.endDate}</p>
            <p>Action Required: Log in to your Host Dashboard to confirm or reject.</p>
          `,
        });
        break;
      }

      case "checkin-reminder-email": {
        const { booking } = job.data;
        await sendEmail({
          to: booking.user.email,
          subject: "Your trip is coming up!",
          html: `
            <h2>Get Ready for Your Trip</h2>
            <p>Your stay at ${booking.property.title} starts soon.</p>
            <p>Check-in Date: ${booking.startDate}</p>
            <p>Host: ${booking.property.owner.name}</p>
          `,
        });
        break;
      }

      case "booking-confirmed-email": {
        const { booking } = job.data;
        console.log("🔥 SENDING CONFIRMED EMAIL");
        await sendEmail({
          to: booking.user.email,
          subject: "Booking Confirmed",
          html: `<h2>Booking Confirmed</h2>`,
          replyTo: booking.property.email,
        });
        break;
      }

      case "booking-completed-email": {
        const { booking } = job.data;

        await sendEmail({
          to: booking.user.email,
          subject: "Booking Completed",
          html: `<h2>Thanks for staying</h2>`,
          replyTo: booking.property.email,
        });
        break;
      }

      case "booking-cancelled-email": {
        const { booking } = job.data;

        await sendEmail({
          to: booking.user.email,
          subject: "Booking Cancelled",
          html: `
            <h2>Your booking was cancelled</h2>
            <p>Property: ${booking.property.title}</p>
            <p>Status: ${booking.status}</p>
          `,
          replyTo: booking.property.email,
        });
        break;
      }

      case "otp-email": {
        const { email, otp } = job.data;
        console.log("JOB RECEIVED:", job.name, job.data);
        await sendEmail({
          from: "StayFinder <dheerajsingh@email.com>",
          to: email,
          subject: "Your OTP",
          html: `<h2>${otp}</h2><p>Valid for 10 minutes</p>`,
        });
        break;
      }
      case "payment-success-email": {
        const { email, booking, amount } = job.data;

        await sendEmail({
          to: email,
          subject: "Payment Successful 🎉",
          html: `
      <h2>Payment Successful</h2>
      <p>Your booking for <b>${booking.property.title}</b> is confirmed.</p>
      <p>Amount Paid: ₹${amount}</p>
      <p>From: ${booking.startDate}</p>
      <p>To: ${booking.endDate}</p>
    `,
        });
        break;
      }

      case "payment-failed-email": {
        const { email, booking, reason } = job.data;

        await sendEmail({
          to: email,
          subject: "Payment Failed ❌",
          html: `
      <h2>Payment Failed</h2>
      <p>Your payment for <b>${booking.property.title}</b> failed.</p>
      <p>Reason: ${reason || "Unknown error"}</p>
      <p>Please try again.</p>
    `,
        });
        break;
      }
    }
  },
  {
    connection: bullmqConnection,
  },
);
