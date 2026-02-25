export type CreatePaymentResponse = {
  msg: string;
  orderId: string;
  amount: number;
  currency: string;
  key: string;
};

export type CreatepaymentPayload = {
  bookingId: string;
};
