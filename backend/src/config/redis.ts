import Redis from "ioredis";

export const redisClient = new Redis(process.env.REDIS_URL!);
redisClient.on("connect", () => {
  console.log("redis COnnected");
});

redisClient.on("error", (err) => {
  console.log("redis error", err);
});
