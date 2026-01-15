import {
  type UpdatePropertyPayload,
  type CreatePropertyPayload,
  type PropertyListResponse,
  type PropertyPayload,
  type SinglePropertyPayload,
  type UpdatePropertyResponse,
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
};
