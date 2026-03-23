import type {
  CreatepaymentPayload,
  CreatePaymentResponse,
} from "../features/payment/payment.types";
import { api } from "./api";
import { handleApiError } from "../utils/errorHandler";
import {
  canSubmit,
  recordSubmission,
  markPaymentPending,
  clearPaymentPending,
} from "../utils/requestDedup";
import { v4 as uuidv4 } from "uuid";

export const paymentServices = {
  /**
   * Create payment with critical duplicate charge prevention
   * Uses idempotency key + localStorage + in-memory tracking
   */
  createPayment: async (data: CreatepaymentPayload) => {
    const { bookingId } = data;

    // CHECK 1: Prevent rapid re-submission
    if (!canSubmit(`payment-${bookingId}`)) {
      const error = new Error("Please wait before retrying payment");
      handleApiError(error, "Rate limited payment");
      throw error;
    }

    recordSubmission(`payment-${bookingId}`);

    // Generate idempotency key (critical for backend dedup)
    const idempotencyKey = data.idempotencyKey || uuidv4();

    try {
      const response = await api.post<CreatePaymentResponse>(
        "/payment/create",
        {
          bookingId,
        },
        {
          headers: {
            // Idempotency-Key: Backend uses this to prevent duplicate processing
            "idempotency-key": idempotencyKey,
            "x-payment-intent": bookingId, // Additional tracking
          },
        },
      );

      // Mark as pending for short window to guard accidental double-click retries.
      const amount =
        response.data && "amount" in response.data
          ? Number((response.data as any).amount || 0)
          : 0;
      markPaymentPending(bookingId, amount);

      // Payment initiated successfully
      return response;
    } catch (error) {
      // Clear pending status on error
      const baseError = error as any;
      const amount = Number(baseError?.response?.data?.amount || 0);
      clearPaymentPending(bookingId, amount);

      handleApiError(error, "Payment creation failed");
      throw error;
    }
  },

  /**
   * Verify payment status with caching
   */
  verifyPayment: async (bookingId: string) => {
    const error = new Error(
      `Payment verification endpoint is unavailable for booking ${bookingId}`,
    );
    handleApiError(error, "Payment verification failed");
    throw error;
  },

  /**
   * Get payment details
   */
  getPayment: async (paymentId: string) => {
    const error = new Error(
      `Payment details endpoint is unavailable for payment ${paymentId}`,
    );
    handleApiError(error, "Failed to fetch payment details");
    throw error;
  },

  /**
   * Refund payment
   */
  refundPayment: async (paymentId: string, _reason?: string) => {
    const error = new Error(
      `Refund endpoint is unavailable for payment ${paymentId}`,
    );
    handleApiError(error, "Refund request failed");
    throw error;
  },
};
