import { Queue } from "bullmq";

export const paymentQueue = new Queue("paymentQueue", {
  connection: {
    url: process.env.REDIS_URL,
  },
});
