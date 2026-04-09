import { Queue } from "bullmq";
import { bullmqConnection } from "../config/redis";

export const bookingQueue = new Queue("bookingQueue", {
  connection: bullmqConnection,
});
