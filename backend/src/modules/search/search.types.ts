export interface PropertySerachQuery {
  city?: string;
  address?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  country?: string;
  state?: string;
  page?: number;
  limit?: number;
  amenities?: string[];
}
// Add hasSome vs hasEvery toggle
