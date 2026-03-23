import { Queue } from "bullmq";
import { redisUrl } from "../config/redis";

export const bookingQueue = new Queue("emailQueue", {
  connection: {
    url: redisUrl,
  },
});
