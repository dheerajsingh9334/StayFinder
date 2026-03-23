import { Request, Response } from "express";
import { PropertySerachQuery } from "./search.types";
import { validatePropertySearchQuery } from "./search.validation";
import { searchProperty } from "./search.services";
import { parseSearchQueryAI } from "./aisearchparser";

import { redisClient } from "../../config/redis";
import { addAiSearchJob } from "../../jobs/ai.job";

export default class SearchController {
  static searchProperty = async (req: Request, res: Response) => {
    try {
      const query = req.query as unknown as PropertySerachQuery;
      const rawAmenities = req.query.amenities;

      if (typeof rawAmenities === "string") {
        query.amenities = rawAmenities.split(",").map((a) => a.trim());
      }
      validatePropertySearchQuery(query);
      const key = `search:${JSON.stringify(query)}`;
      const cache = await redisClient.get(key);
      if (cache) {
        return res.status(200).json(JSON.parse(cache));
      }
      const properties = await searchProperty(query);
      const responseData = {
        msg: "Property featched successfully",
        count: properties.count,
        data: properties,
      };
      await redisClient.set(key, JSON.stringify(responseData), "EX", 300);
      return res.status(200).json(responseData);
    } catch (error: any) {
      console.error("Search Controller error");
      return res.status(500).json({
        msg: "Server error",
        message: error.message,
      });
    }
  };
  static aiSearch = async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ msg: "Search text is required" });
      }

      const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
      const key = `ai:result:${normalized}`;

      // 🔥 STEP 1: check cache
      let cache = await redisClient.get(key);
      if (cache) {
        console.log("✅ Cache HIT");
        return res.status(200).json(JSON.parse(cache));
      }

      console.log("❌ Cache MISS");

      // 🔥 STEP 2: add job (only once)
      await addAiSearchJob(normalized);

      // // 🔥 STEP 3: wait for worker (THIS IS THE REAL FIX)
      // for (let i = 0; i < 10; i++) {
      //   await new Promise((r) => setTimeout(r, 500)); // wait 500ms
      const result = await Promise.race([
        (async () => {
          while (true) {
            const cache = await redisClient.get(key);
            if (cache) return JSON.parse(cache);
            await new Promise((r) => setTimeout(r, 500));
          }
        })(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 5000),
        ),
      ]);

      return res.status(200).json(result);
    } catch (error: any) {
      // Fallback to direct execution when queue/worker is delayed or unavailable.
      if (error?.message === "timeout") {
        try {
          const { text } = req.body;
          const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
          const fallbackKey = `ai:result:${normalized}`;
          const query = await parseSearchQueryAI(normalized);

          if (!query || typeof query !== "object") {
            throw new Error("Invalid parsed query");
          }

          validatePropertySearchQuery(query as PropertySerachQuery);
          const properties = await searchProperty(query as PropertySerachQuery);
          const responseData = {
            msg: "Property fetched successfully",
            ...properties,
          };

          await redisClient.set(
            fallbackKey,
            JSON.stringify(responseData),
            "EX",
            60,
          );
          return res.status(200).json(responseData);
        } catch (fallbackError: any) {
          console.log("AI fallback failed", fallbackError?.message);
          return res
            .status(500)
            .json({ msg: "AI search failed", message: fallbackError?.message });
        }
      }

      console.log(error);
      return res.status(500).json({ msg: "AI search failed" });
    }
  };
}
