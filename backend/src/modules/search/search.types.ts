export interface PropertySerachQuery {
  city?: string;
  address?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  search?: string;
  startDate?: string;
  endDate?: string;

  page?: number;
  limit?: number;
}
