import { propertyServices } from "../../services/property.services";
import type {
  CreatePropertyPayload,
  PropertyListResponse,
  PropertyPayload,
  UpdatePropertyPayload,
} from "./property.types";

export const CreatePropertyApi = async (
  data: CreatePropertyPayload,
): Promise<PropertyPayload> => {
  const res = await propertyServices.create(data);
  return res.data;
};

export const GetAllApi = async (
  page: number,
): Promise<PropertyListResponse> => {
  const res = await propertyServices.getAll(page);
  return res.data;
};

export const getSingleApi = async (id: string): Promise<PropertyPayload> => {
  const res = await propertyServices.getSingle(id);
  return res.data.property;
};

export const getOwnerPropertyApi = async (
  page: number,
): Promise<PropertyListResponse> => {
  const res = await propertyServices.getOwnerProperty(page);
  return res.data;
};

export const updatePropertyApi = async (
  id: string,
  data: UpdatePropertyPayload,
): Promise<PropertyPayload> => {
  const res = await propertyServices.update(id, data);
  return res.data.property;
};
