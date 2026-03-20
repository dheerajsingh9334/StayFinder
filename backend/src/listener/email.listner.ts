import { Auth_Events } from "../event/auth.events";
import eventBus from "../event/event";
import { emailQueue } from "../queue/email.queue";
import { sendEmail } from "../services/email.service";

eventBus.on(Auth_Events.Send_Otp, async ({ email, otp }) => {
  await emailQueue.add(
    "otp-email",
    {
      email,
      otp,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
  console.log("OTP EVENT RECEIVED", email);
});
