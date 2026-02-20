import { Auth_Events } from "../event/auth.events";
import eventBus from "../event/event";
import { sendEmail } from "../services/email.service";

eventBus.on(Auth_Events.Send_Otp, async ({ email, otp }) => {
  console.log("EMAIL LISTENER HIT");
  await sendEmail({
    to: email,
    subject: "Your Login OTP",
    html: `<h2>Your OTP is ${otp}</h2><p>Valid for 10 minutes</p>`,
  });
});
