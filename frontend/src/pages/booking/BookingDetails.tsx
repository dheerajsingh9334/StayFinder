import React, { useEffect } from "react";
import { useUserBookings } from "../../features/booking/booking.hooks";
import { useCreatePayment } from "../../features/payment/payment.hooks";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function BookingDetails() {
  const { id } = useParams();
  const { data, refetch, isPending, isError, error } = useUserBookings();
  const createPayment = useCreatePayment();
  const navigate = useNavigate();

  const booking = data?.booking.find((b) => b.id === id);

  // 🔔 Error toast
  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(error.message, { id: "booking-error" });
    }
  }, [isError, error]);

  // 🚀 AUTO REDIRECT WHEN CONFIRMED
  useEffect(() => {
    if (booking?.status === "CONFIRMED") {
      toast.success("Booking Confirmed 🎉");
      navigate("/mybooking");
    }
  }, [booking?.status, navigate]);

  if (!booking) return <p>Loading...</p>;

  const handlePay = async () => {
    try {
      const payment = await createPayment.mutateAsync({
        bookingId: booking.id,
      });

      const options = {
        key: payment.key,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.orderId,

        handler: async () => {
          toast.loading("Verifying payment...");
          await refetch(); // webhook confirm karega
        },
      };

      const razor = new (window as any).Razorpay(options);
      razor.open();
    } catch (err) {
      toast.error("Payment failed");
    }
  };

  return (
    <div>
      <h2>{booking.property.title}</h2>
      <p>Status: {booking.status}</p>
      <p>Total: ₹{booking.totalPrice}</p>

      {booking.status === "PENDING_PAYMENT" && (
        <button onClick={handlePay} disabled={isPending}>
          {isPending ? "Processing..." : "Pay Now"}
        </button>
      )}

      {booking.status === "CONFIRMED" && <p>Booking Confirmed ✅</p>}
      {booking.status === "COMPLETED" && <p>Write Review ⭐</p>}
    </div>
  );
}
