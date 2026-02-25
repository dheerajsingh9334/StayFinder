// Date fully blocked → ❌ Not bookable

// Date partially booked → ⚠️ “Only 2 rooms left”

// Date fully booked → ❌ Sold out

// Date fully free → ✅ Available

// Exactly railway / airline logic 🚆✈️

import React from "react";
import { useUserBookings } from "../../features/booking/booking.hooks";
import { useCreatePayment } from "../../features/payment/payment.hooks";
import { useParams } from "react-router-dom";

export default function BookingDetails() {
  const { id } = useParams();
  const { data, refetch } = useUserBookings();
  const createPayment = useCreatePayment();

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
        // payment success callback (frontend only)
        // backend webhook will confirm booking
        await refetch();
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
        <button onClick={handlePay}>Pay Now</button>
      )}

      {booking.status === "CONFIRMED" && <p>Booking Confirmed ✅</p>}
      {booking.status === "COMPLETED" && <p>Write Review ⭐</p>}
    </div>
  );
}
