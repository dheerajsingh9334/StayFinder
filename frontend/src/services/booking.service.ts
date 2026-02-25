import type {
  CancleBookingResponse,
  CreateBookingPayload,
  CreateBookingResponse,
  GetUserBookingResponse,
} from "../features/booking/booking.types";
import { api } from "./api";

export const BookingServices = {
  getUserBooking: () => api.get<GetUserBookingResponse>("booking/my-booking"),

  create: (data: CreateBookingPayload) =>
    api.post<CreateBookingResponse>("/booking/create", data),

  cancel: (bookingId: string) =>
    api.patch<CancleBookingResponse>(`booking/cancle${bookingId}`),
};
