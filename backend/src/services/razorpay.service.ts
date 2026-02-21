import Razorpaylib from "razorpay-node-typescript";

const razorpay = new Razorpaylib({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

export default razorpay;
