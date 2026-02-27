import { useUserBookings } from "../../features/booking/booking.hooks";
import { useNavigate } from "react-router-dom";

import { ThreeDot } from "react-loading-indicators";
import { BookingStatus } from "../../features/booking/booking.types";
import { useRazorpayPayment } from "../../features/payment/useRazorpayPayment";

export default function MyBooking() {
  const { data, isError, isLoading } = useUserBookings();
  const { startPayment } = useRazorpayPayment();
  const navigate = useNavigate();
  if (isLoading) {
    return <ThreeDot color={["#32cd32", "#327fcd", "#cd32cd", "#cd8032"]} />;
  }

  if (isError || !data) {
    return <div>Failed to load data</div>;
  }

  if (!data?.booking.length) {
    return <div>No Booking Found</div>;
  }
  const { booking: items } = data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">My Bookings</h1>

      {items.map((p) => (
        <div
          key={p.id}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
        >
          <p>Start: {new Date(p.startDate).toLocaleDateString()}</p>
          <p>End: {new Date(p.endDate).toLocaleDateString()}</p>
          <p>Total: ₹{p.totalPrice}</p>
          <p>Status: {p.status}</p>
          {p.status === BookingStatus.PENDING_PAYMENT && (
            <button onClick={() => startPayment(p.id)}>Complete Payment</button>
          )}
          <button onClick={() => navigate(`/properties/${p.property.id}`)}>
            View Property
          </button>
        </div>
      ))}
    </div>
  );
}
