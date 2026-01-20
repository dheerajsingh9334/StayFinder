import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreatePropertyApi, GetAllApi, getSingleApi } from "./property.api";
import {
  CreatePropertyPayload,
  type PropertyListResponse,
  type PropertyPayload,UpdatePropertyPayload
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
  return useMutation<PropertyPayload,Error,>({
    mutationFn: ({ id, data }:{id:;data:})
  });
};

export const useOwnerProperties = (page: number) => {};
