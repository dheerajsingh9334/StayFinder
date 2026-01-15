import { PropertySerachQuery } from "./search.types";

export const validatePropertySearchQuery = (query: PropertySerachQuery) => {
  if (query.minPrice && query.maxPrice) {
    if (query.minPrice > query.maxPrice) {
      throw new Error("maxPrice must be gretor than minPrice");
    }
  }

  if (query.startDate && query.endDate) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    if (start >= end) {
      throw new Error("Invalid date range");
    }
  }
};
