import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || "6379";
export const redisUrl =
  process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

if (!process.env.REDIS_URL) {
  console.warn(`[Redis] REDIS_URL is not defined. Falling back to ${redisUrl}`);
}

// Singleton ioredis client — used for direct cache operations (SET/GET/DEL)
export const redisClient = new Redis(redisUrl, {
  db: 0,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// BullMQ connection config — plain object, fully compatible with BullMQ's
// bundled ioredis types. Shared across all Queues and Workers.
export const bullmqConnection = {
  url: redisUrl,
};
