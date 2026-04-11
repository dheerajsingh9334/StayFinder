import { Worker } from "bullmq";
import { redisClient, bullmqConnection } from "../config/redis";
import { parseSearchQueryAI } from "../modules/search/aisearchparser";
import { validatePropertySearchQuery } from "../modules/search/search.validation";
import { searchProperty } from "../modules/search/search.services";

console.log("🚀 Worker started...");
new Worker(
  "ai-search",
  async (job) => {
    const { text } = job.data;
    const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();

    const query = await parseSearchQueryAI(normalized);

    if (!query || typeof query !== "object") {
      throw new Error("Invalid parsed query");
    }

    validatePropertySearchQuery(query);

    const properties = await searchProperty(query);

    const responseData = {
      msg: "Property fetched successfully",
      ...properties,
    };

    const key = `ai:result:${normalized}`;

    // if (cache) {
    //   console.log("✅ Cache HIT");
    //   return res.status(200).json(JSON.parse(cache));
    // }
    // console.log("Saving to Redis:", key);

    // console.log("❌ Cache MISS", key);

    await redisClient.set(key, JSON.stringify(responseData), "EX", 300);

    return responseData;
  },
  {
    connection: bullmqConnection,
    concurrency: 5,
  },
);
