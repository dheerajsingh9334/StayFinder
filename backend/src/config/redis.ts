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

const retryStrategy = (times: number) => {
  if (times > 20) {
    return null;
  }
  return Math.min(times * 200, 5000);
};

// Diagnostic log for production deployment
try {
  const maskedUrl = redisUrl.replace(/\/\/.*@/, "//***:***@");
  console.log(`[Redis] Attempting to connect to: ${maskedUrl}`);
} catch (e) {
  console.log("[Redis] Attempting to connect to specialized URL...");
}

const commonOptions: any = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy,
  family: 4, 
  connectTimeout: 20000, // Even longer timeout
  reconnectOnError: (err: any) => {
    const targetError = "READONLY";
    if (err.message.slice(0, targetError.length) === targetError) {
      return true;
    }
    return false;
  },
};

// Explicitly enable TLS if using rediss://
if (redisUrl.startsWith("rediss://")) {
  commonOptions.tls = {
    rejectUnauthorized: false, // Often needed for serverless environments
  };
}

// Singleton ioredis client — used for direct cache operations (SET/GET/DEL)
export const redisClient = new Redis(redisUrl, {
  ...commonOptions,
  db: 0,
});

// BullMQ connection options shared across queues and workers.
export const bullmqConnection = new Redis(redisUrl, {
  ...commonOptions,
}) as any;
