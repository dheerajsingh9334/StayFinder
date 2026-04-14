import { availabilityService } from "../../services/availability.services";
import type { CalendarResponse } from "./availbility.types";

export const getCalendarViewApi = async (
  propertyId: string,
  startDate: string,
  endDate: string,
): Promise<CalendarResponse> => {
  const res = await availabilityService.getCalendar(
    propertyId,
    startDate,
    endDate,
  );
  return res.data;
};

export const blockAvailabilityApi = async (data: { propertyId: string, startTime: string, endTime: string }) => {
  const res = await availabilityService.blockTime(data);
  return res.data;
};

export const unblockAvailabilityApi = async (blockId: string) => {
  const res = await availabilityService.unblockTime(blockId);
  return res.data;
};

export const getHostBlocksApi = async (propertyId: string) => {
  const res = await availabilityService.getHostBlocks(propertyId);
  return res.data;
};
