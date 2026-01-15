import { Request, Response } from "express";
import { PropertySerachQuery } from "./search.types";
import { validatePropertySearchQuery } from "./search.validation";
import { searchProperty } from "./search.services";

export default class SearchController {
  static searchProperty = async (req: Request, res: Response) => {
    try {
      const query = req.query as unknown as PropertySerachQuery;
      console.log("hi");

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
}
