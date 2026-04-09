import { Queue } from "bullmq";
import { bullmqConnection } from "../config/redis";

export const emailQueue = new Queue("emailQueue", {
  connection: bullmqConnection,
});
