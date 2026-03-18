export type CreatePaymentResponse = {
  msg: string;
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  status: PaymentStatus;
};

export type CreatepaymentPayload = {
  bookingId: string;
  idempotencyKey: string;
};

export enum PaymentStatus {
  INITIATED = "INITIATED",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}
