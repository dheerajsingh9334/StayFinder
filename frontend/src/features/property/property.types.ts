export type CreatePropertyPayload = {
  title: string;
  description: string;
  price: number;
  state: string;
  address: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  images: string[];
  amenities: string[];
  lat?: number;
  lng?: number;
};

export type UpdatePropertyPayload = {
  title: string;
  description: string;
  price: number;
  state: string;
  address?: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  images: string[];
  amenities: string[];
  lat?: number;
  lng?: number;
};

export type UpdatePropertyResponse = {
  msg: string;
  property: PropertyPayload;
};

export type PropertyPayload = {
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
  images?: string[];
  amenities?: string[];
  status: PropertyStatus;
  averageRating: number;
  reviewCount: number;
  ownerId: string;
  owner: {
    id: string;
    name?: string;
    phone?: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
  updatedAt: string;
  availability: unknown[]; // TODO: type later
};

export type PropertyListResponse = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: PropertyPayload[];
};

export enum PropertyStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  REJECTED = "REJECTED",
  DELETED = "DELETED",
}

// export type SinglePropertyPayload = {
//   property: PropertyPayload;
// };
