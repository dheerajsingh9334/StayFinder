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
