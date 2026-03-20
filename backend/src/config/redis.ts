import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

export const redisClient = new Redis(redisUrl, {
  db: 0,
  maxRetriesPerRequest: null,
});

export const redisConnection = {
  connection: {
    url: redisUrl,
    db: 0,
  },
};
