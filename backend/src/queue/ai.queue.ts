import { Queue } from "bullmq";
import { bullmqConnection } from "../config/redis";

export const aiQueue = new Queue("ai-search", {
  connection: bullmqConnection as any,
});
