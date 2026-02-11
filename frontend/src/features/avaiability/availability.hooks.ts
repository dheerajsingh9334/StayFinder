import { useQuery } from "@tanstack/react-query";
import type { CalendarResponse } from "./availbility.types";
import { getCalendarViewApi } from "./availability.api";

export const useAvailability = (
  propertyId: string,
  startDate: string,
  endDate: string,
) => {
  return useQuery<CalendarResponse>({
    queryKey: ["availability", propertyId, startDate, endDate],
    queryFn: () => getCalendarViewApi(propertyId, startDate, endDate),
    refetchInterval: 5000,
  });
};
