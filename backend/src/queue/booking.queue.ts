import { Queue } from "bullmq";

export const emailQueue = new Queue("emailQueue", {
  connection: {
    url: process.env.REDIS_URL,
  },
});
