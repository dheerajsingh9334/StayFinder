import { Queue } from "bullmq";
import { redisUrl } from "../config/redis";

export const paymentQueue = new Queue("paymentQueue", {
  connection: {
    url: redisUrl,
  },
});
