import { Queue } from "bullmq";
import { redisUrl } from "../config/redis";

export const aiQueue = new Queue("ai-search", {
  connection: {
    url: redisUrl,
  },
});
