import {
  type UpdatePropertyPayload,
  type CreatePropertyPayload,
  type PropertyListResponse,
  type PropertyPayload,
  type SinglePropertyPayload,
  type UpdatePropertyResponse,
  type NearbyPropertyResponse,
} from "../features/property/property.types";
import { api } from "./api";

export const propertyServices = {
  create: (data: CreatePropertyPayload) =>
    api.post<PropertyPayload>("/property/create", data),

  getAll: (page: number) =>
    api.get<PropertyListResponse>(`/property?page=${page}`),

  getSingle: (id: string) => api.get<SinglePropertyPayload>(`/property/${id}`),

  getOwnerProperty: (page: number) =>
    api.get<PropertyListResponse>(`/property/owner/me?page=${page}`),

  update: (id: string, data: UpdatePropertyPayload) =>
    api.patch<UpdatePropertyResponse>(`/property/update/${id}`, data),

  getNearBy: (lat: number, lng: number, radius = 0.1, limit = 20) =>
    api.get<NearbyPropertyResponse>(
      `/property/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`,
    ),
};
