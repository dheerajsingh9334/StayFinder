import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CancleBookingResponse,
  type CreateBookingPayload,
  type CreateBookingResponse,
  type GetUserBookingResponse,
} from "./booking.types";
import {
  CancleBookingApi,
  CreateBookingApi,
  getUserBookingApi,
} from "./booking.api";

export const useCreateBooking = () => {
  const query = useQueryClient();
  return useMutation<CreateBookingResponse, Error, CreateBookingPayload>({
    mutationFn: CreateBookingApi,
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["user-booking"] });
    },
  });
};

export const useCancleBooking = () => {
  const query = useQueryClient();
  return useMutation<CancleBookingResponse, Error, string>({
    mutationFn: CancleBookingApi,

    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["user-booking"] });
    },
  });
};

export const useUserBookings = () => {
  return useQuery<GetUserBookingResponse>({
    queryKey: ["user-bookings"],
    queryFn: getUserBookingApi,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
    enabled: true,
  });
};
