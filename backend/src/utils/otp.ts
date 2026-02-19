export const generateOtp = (): string => {
  const otp = Math.floor(1000000 + Math.random() * 900000).toString();
  console.log(otp);
  return otp;
};

export const otpExpiry = () => {
  return new Date(Date.now() + 1000 * 60 * 100);
};
