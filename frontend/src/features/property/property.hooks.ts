import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreatePropertyApi,
  GetAllApi,
  getNearByApi,
  getOwnerPropertyApi,
  getSingleApi,
  updatePropertyApi,
} from "./property.api";
import {
  type NearbyPropertyResponse,
  type CreatePropertyPayload,
  type PropertyListResponse,
  type PropertyPayload,
  type UpdatePropertyVar,
} from "./property.types";

export const useProperties = (page: number) => {
  return useQuery<PropertyListResponse>({
    queryKey: ["properties", page],
    queryFn: () => GetAllApi(page),
    placeholderData: (previosData) => previosData,
  });
};

export const usePropertyDetails = (id: string) => {
  return useQuery<PropertyPayload>({
    queryKey: ["property", id],
    queryFn: () => getSingleApi(id),
    enabled: !!id,
  });
};

export const useCreateProperty = () => {
  const query = useQueryClient();
  return useMutation<PropertyPayload, PropertyPayload, CreatePropertyPayload>({
    mutationFn: CreatePropertyApi,
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["properties"] });
      query.invalidateQueries({ queryKey: ["owner-properties"] });
    },
  });
};

export const useUpdateProperty = () => {
  const query = useQueryClient();

  return useMutation<PropertyPayload, Error, UpdatePropertyVar>({
    mutationFn: ({ id, data }) => updatePropertyApi(id, data),

    onSuccess: (_, { id }) => {
      query.invalidateQueries({ queryKey: ["property", id] });
      query.invalidateQueries({ queryKey: ["owner-properties"] });
    },
  });
};
export const useOwnerProperties = (page: number) => {
  return useQuery<PropertyListResponse>({
    queryKey: ["owner-properties", page],
    queryFn: () => getOwnerPropertyApi(page),
    placeholderData: (previosData) => previosData,
  });
};

export const useNearByProperty = (
  lat?: number,
  lng?: number,
  radius = 0.1,
  limit = 20,
) => {
  return useQuery<NearbyPropertyResponse>({
    queryKey: ["nearBy", lat, lng, radius, limit],
    queryFn: () => getNearByApi(lat!, lng!, radius, limit),
    enabled: !!lat && !!lng,
    staleTime: 6000,
    placeholderData: (previosData) => previosData,
  });
};
