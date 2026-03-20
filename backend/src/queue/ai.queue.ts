import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const aiQueue = new Queue("ai-search", {
  connection: {
    url: process.env.REDIS_URL,
  },
});
