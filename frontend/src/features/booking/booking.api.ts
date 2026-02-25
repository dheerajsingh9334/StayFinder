import { BookingServices } from "../../services/booking.service";
import type {
  CancleBookingResponse,
  CreateBookingPayload,
  CreateBookingResponse,
  GetUserBookingResponse,
} from "./booking.types";

export const CreateBookingApi = async (
  data: CreateBookingPayload,
): Promise<CreateBookingResponse> => {
  const res = await BookingServices.create(data);
  return res.data;
};

export const getUserBookingApi = async (): Promise<GetUserBookingResponse> => {
  const res = await BookingServices.getUserBooking();
  return res.data;
};

export const CancleBookingApi = async (
  bookingId: string,
): Promise<CancleBookingResponse> => {
  const res = await BookingServices.cancel(bookingId);
  return res.data;
};
