export interface CreateBookingBody {
  propertyId: string;
  startDate: string;
  endDate: string;
  capacity: number;
}

export type BookintParams = {
  bookingId: string;
};
