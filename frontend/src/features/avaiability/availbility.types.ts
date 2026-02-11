export type BlockTimeBody = {
  propertyId: string;
  startTime: string;
  endTime: string;
};

export type CalenderDay = {
  date: string;
  status: "AVAILABLE" | "LIMITED" | "SOLD_OUT" | "UNAVAILABLE";
  remainingCapacity: number;
};

export type CalendarResponse = {
  propertyId: string;
  calender: CalenderDay[];
};

export type bookingAvailabilityResponse = {
  status: "AVAILABLE" | "LIMITED" | "SOLD_OUT" | "UNAVAILABLE";
  maxBookingCapacity: number;
};
export type DayInfo = {
  date: string;
  status: string;
  remainingCapacity: number;
};
export type CalendarViewProps = {
  propertyId: string;
};
