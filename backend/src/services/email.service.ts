import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

export const sendEmail = async ({
  from,
  to,
  subject,
  html,
  replyTo,
}: {
  from?: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) => {
  await transporter.sendMail({
    from: from || `"StayFinder" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    replyTo,
  });
};
