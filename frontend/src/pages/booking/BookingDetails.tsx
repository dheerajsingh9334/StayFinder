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

  useEffect(() => {
    if (isError) {
      toast.error(error.message, { id: "bookng error" });
    }
  }, [isError, error]);
  const booking = data?.booking.find((b) => b.id === id);

  if (!booking) return <p>Loading...</p>;

  const handlePay = async () => {
    const payment = await createPayment.mutateAsync({
      bookingId: booking.id,
    });

    const options = {
      key: payment.key,
      amount: payment.amount,
      currency: payment.currency,
      order_id: payment.orderId,
      handler: async () => {
        await new Promise((r) => setTimeout(r, 2000));
        const res = await refetch();
        const updated = res.data?.booking.find((b) => b.id === booking.id);
        if (updated?.status === "CONFIRMED") {
          navigate("/mybooking");
          return;
        }
        // payment success callback (frontend only)
        // backend webhook will confirm booking
        // await refetch();
      },
    };

    const razor = new (window as any).Razorpay(options);
    razor.open();
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
