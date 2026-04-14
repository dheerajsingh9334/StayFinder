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

export const useHostBlocks = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ["availability-blocks", propertyId],
    queryFn: () => getHostBlocksApi(propertyId as string),
    enabled: Boolean(propertyId),
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blockAvailabilityApi, unblockAvailabilityApi, getHostBlocksApi } from "./availability.api";

export const useBlockAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockAvailabilityApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["availability-blocks", variables.propertyId] });
    },
  });
};

export const useUnblockAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unblockAvailabilityApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["availability-blocks"] });
    },
  });
};
