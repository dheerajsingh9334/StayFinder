import { Request, Response } from "express";
import { PropertySerachQuery } from "./search.types";
import { validatePropertySearchQuery } from "./search.validation";
import { searchProperty } from "./search.services";
import { parseSearchQueryAI } from "./aisearchparser";

export default class SearchController {
  static searchProperty = async (req: Request, res: Response) => {
    try {
      const query = req.query as unknown as PropertySerachQuery;
      const rawAmenities = req.query.amenities;

      if (typeof rawAmenities === "string") {
        query.amenities = rawAmenities.split(",").map((a) => a.trim());
      }
      validatePropertySearchQuery(query);

      const properties = await searchProperty(query);

      return res.status(200).json({
        msg: "Property featched successfully",
        count: properties.count,
        data: properties,
      });
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

      const query: PropertySerachQuery = await parseSearchQueryAI(text);

      console.log("Parsed Query:", query);

      // validatePropertySearchQuery(query);

      const properties = await searchProperty(query);
      if (!query || typeof query !== "object") {
        return res.status(400).json({ msg: "Invalid parsed query" });
      }
      return res.status(200).json({
        msg: "Property featched successfully",
        count: properties.count,
        data: properties,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({ msg: "AI search failed" });
    }
  };
}
