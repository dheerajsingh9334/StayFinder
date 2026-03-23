import { Queue } from "bullmq";
import { redisUrl } from "../config/redis";

export const emailQueue = new Queue("emailQueue", {
  connection: {
    url: redisUrl,
  },
});
