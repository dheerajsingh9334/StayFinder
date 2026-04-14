import { Queue } from "bullmq";
import { bullmqConnection } from "../config/redis";

export const paymentQueue = new Queue("paymentQueue", {
  connection: bullmqConnection as any,
});
