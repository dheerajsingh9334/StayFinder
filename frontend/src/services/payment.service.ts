import type {
  CreatepaymentPayload,
  CreatePaymentResponse,
} from "../features/payment/payment.types";
import { api } from "./api";

export const paymentServices = {
  createPayment: (data: CreatepaymentPayload) =>
    api.post<CreatePaymentResponse>(
      "/payment/create",
      {
        bookingId: data.bookingId,
      },
      {
        headers: {
          "idempotency-key": data.idempotencyKey,
        },
      },
    ),
};
