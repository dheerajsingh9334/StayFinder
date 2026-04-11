export interface PropertySerachQuery {
  city?: string;
  address?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  country?: string;
  state?: string;
  page?: number;
  limit?: number;
  amenities?: string[];
  sortBy?: string;
}
// Add hasSome vs hasEvery toggle
