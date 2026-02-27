export type CreateBookingPayload = {
  propertyId: string;
  startDate: string;
  endDate: string;
  capacity: number;
};

export type CreateBookingResponse = {
  msg: string;
  booking: UserBooking;
};

export enum BookingStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export type UserBooking = {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  capacity: number;
  status: BookingStatus;
  createdAt: string;
  property: BookingProperty;
};

export type BookingProperty = {
  id: string;
  title: string;
  city: string;
  address?: string;
  images: string[];
};
export type CreatePaymentPayload = {
  bookingId: string;
};

export type BookingCountdown = {
  expiresAt: number;
  timeLeft: number;
};

export type CreateReviewPayload = {
  bookingId: string;
  rating: number;
  comment: string;
};

export type GetUserBooking = {
  id: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  createAt: string;
  property: BookingProperty;
};

export type GetUserBookingResponse = {
  msg: string;
  booking: UserBooking[];
};

export type CreatePaymentResponse = {
  msg: string;
  orderId: string;
  amount: number;
  currency: string;
  key: string;
};

export type CancleBookingResponse = {
  msg: string;
  booking: UserBooking;
};
