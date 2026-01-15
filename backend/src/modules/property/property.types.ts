import { PropertyStatus } from "@prisma/client";

export interface CreatePropertyBody {
  title: string;
  description: string;
  price: number;
  country?: string;
  state: string;
  city: string;
  lat?: number;
  lng?: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
}

export interface updatePropertyBody {
  title?: string;
  description?: string;
  price?: number;
  country?: string;
  state?: string;
  city?: string;
  lat?: number;
  lng?: number;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  images?: string[];
  amenities?: string[];
}

export interface PropertyResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  country: string;
  state: string;
  city: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  status: PropertyStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
