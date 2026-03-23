import { useQuery } from "@tanstack/react-query";
import type { CalendarResponse } from "./availbility.types";
import { getCalendarViewApi } from "./availability.api";

export const useAvailability = (
  propertyId: string | undefined,
  startDate: string,
  endDate: string,
) => {
  return useQuery<CalendarResponse>({
    queryKey: ["availability", propertyId, startDate, endDate],
    queryFn: () => getCalendarViewApi(propertyId as string, startDate, endDate),
    enabled: Boolean(propertyId),
    refetchInterval: 60000,
    retry: 1,
  });
};
