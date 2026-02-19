import { Auth_Events } from "../../event/auth.events";
import eventBus from "../../event/event";
import prisma from "../../utils/dbconnect";
import { generateOtp, otpExpiry } from "../../utils/otp";

export const sendEMailOtp = async (userId: string, email: string) => {
  try {
    const otp = generateOtp();

    await prisma.otp.create({
      data: { userId, code: otp, expiresAt: otpExpiry() },
    });

    eventBus.emit(Auth_Events.Send_Otp, {
      email,
      otp,
    });
  } catch (error) {}
};
