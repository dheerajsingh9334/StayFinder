import type {
  CalendarResponse,
  bookingAvailabilityResponse,
} from "../features/avaiability/availbility.types";
import { api } from "./api";

export const availabilityService = {
  getCalendar: (propertyId: string, startDate: string, endDate: string) =>
    api.get<CalendarResponse>(
      `availability/property/${propertyId}/calender?startDate=${startDate}&endDate=${endDate}`,
    ),
  bookingAvailability: (
    propertyId: string,
    startDate: string,
    endDate: string,
  ) =>
    api.get<bookingAvailabilityResponse>(
      `availability/${propertyId}/availability?startDate=${startDate}&endDate=${endDate}`,
    ),
};
