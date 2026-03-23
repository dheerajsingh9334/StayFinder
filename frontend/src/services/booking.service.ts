import type {
  CancleBookingResponse,
  CreateBookingPayload,
  CreateBookingResponse,
  GetUserBookingResponse,
} from "../features/booking/booking.types";
import { api } from "./api";
import { validationSchemas } from "../utils/validationSchemas";
import { handleApiError } from "../utils/errorHandler";
import {
  canSubmit,
  recordSubmission,
  invalidateCache,
} from "../utils/requestDedup";

export const BookingServices = {
  /**
   * Get user's bookings with caching
   */
  getUserBooking: async () => {
    try {
      const response = await api.get<GetUserBookingResponse>(
        "/booking/my-booking",
      );
      return response;
    } catch (error) {
      const err = error as any;
      // Backend returns 404 when no bookings exist; treat it as an empty list.
      if (err?.response?.status === 404) {
        return {
          data: {
            msg: "Booking not found",
            booking: [],
          },
        } as { data: GetUserBookingResponse };
      }
      handleApiError(error, "Failed to fetch bookings");
      throw error;
    }
  },

  /**
   * Create booking with validation and duplicate prevention
   */
  create: async (data: CreateBookingPayload) => {
    // Validate input
    const validated = validationSchemas.booking.create.parse({
      propertyId: data.propertyId,
      startDate: data.startDate,
      endDate: data.endDate,
      capacity: data.capacity,
    });

    // Prevent duplicate bookings
    if (!canSubmit(`booking-create-${data.propertyId}`)) {
      throw new Error("Please wait before creating another booking");
    }
    recordSubmission(`booking-create-${data.propertyId}`);

    try {
      const response = await api.post<CreateBookingResponse>(
        "/booking/create",
        validated,
      );

      // Invalidate bookings cache
      invalidateCache("booking");
      return response;
    } catch (error) {
      handleApiError(error, "Booking creation failed");
      throw error;
    }
  },

  /**
   * Cancel booking with validation
   */
  cancel: async (bookingId: string) => {
    // Basic validation
    if (!bookingId || typeof bookingId !== "string") {
      throw new Error("Invalid booking ID");
    }

    // Prevent duplicate cancellations
    if (!canSubmit(`booking-cancel-${bookingId}`)) {
      throw new Error("Please wait before cancelling again");
    }
    recordSubmission(`booking-cancel-${bookingId}`);

    try {
      const response = await api.patch<CancleBookingResponse>(
        `/booking/cancle/${bookingId}`,
        {},
      );

      // Invalidate bookings cache
      invalidateCache("booking");
      return response;
    } catch (error) {
      handleApiError(error, "Booking cancellation failed");
      throw error;
    }
  },

  /**
   * Complete booking (for hosts)
   */
  complete: async (bookingId: string) => {
    try {
      const response = await api.patch(`/booking/Complete/${bookingId}`, {});
      invalidateCache("booking");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to complete booking");
      throw error;
    }
  },

  /**
   * Get booking details
   */
  getById: async (bookingId: string) => {
    const error = new Error(
      `Booking details endpoint is unavailable for id ${bookingId}`,
    );
    handleApiError(error, "Failed to fetch booking");
    throw error;
  },

  /**
   * Get property bookings (for hosts)
   */
  getPropertyBookings: async (propertyId: string) => {
    try {
      const response = await api.get(`/booking/getBooking/${propertyId}`);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch property bookings");
      throw error;
    }
  },
};
