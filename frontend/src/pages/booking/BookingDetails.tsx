import React, { useEffect } from "react";
import { useUserBookings } from "../../features/booking/booking.hooks";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useRazorpayPayment } from "../../features/payment/useRazorpayPayment";

export default function BookingDetails() {
  const { id } = useParams();
  const { data, isPending, isError, error, refetch } = useUserBookings();
  const navigate = useNavigate();
  const { startPayment } = useRazorpayPayment(refetch);
  const booking = data?.booking.find((b) => b.id === id);

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(error.message, { id: "booking-error" });
    }
  }, [isError, error]);

  useEffect(() => {
    if (booking?.status === "CONFIRMED") {
      toast.success("Booking Confirmed 🎉");
      navigate("/mybooking");
    }
  }, [booking?.status, navigate]);

  if (!booking) return <p>Loading...</p>;

  return (
    <div>
      <h2>{booking.property.title}</h2>
      <p>Status: {booking.status}</p>
      <p>Total: ₹{booking.totalPrice}</p>

      {booking.status === "PENDING_PAYMENT" && (
        <button onClick={() => startPayment(booking.id)} disabled={isPending}>
          {isPending ? "Processing..." : "Pay Now"}
        </button>
      )}
      <button onClick={() => navigate("/mybooking")}>booking History</button>

      {booking.status === "CONFIRMED" && <p>Booking Confirmed ✅</p>}
      {booking.status === "COMPLETED" && <p>Write Review ⭐</p>}
    </div>
  );
}
