import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookingStatus } from "../booking/booking.types";
import { useCreatePayment } from "./payment.hooks";

export const useRazorpayPayment = (refetchBooking?: () => Promise<any>) => {
  const navigate = useNavigate();
  const createPayment = useCreatePayment();

  const startPayment = async (bookingId: string) => {
    try {
      if (createPayment.isPending) return;
      const key = `payment:${bookingId}`;
      let idempotencyKey = sessionStorage.getItem(key);
      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();
        sessionStorage.setItem(key, idempotencyKey);
      }
      const payment = await createPayment.mutateAsync({
        bookingId,
        idempotencyKey,
      });
      const options = {
        key: payment.key,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.orderId,

        handler: async () => {
          toast.loading("Verifying payment...");
          if (!refetchBooking) {
            return;
          }
          const res = await refetchBooking();
          const updated = res.data?.booking;
          if (updated?.status === BookingStatus.CONFIRMED) {
            toast.success("Payment successful 🎉");
            navigate("/mybooking");
          } else {
            toast("Payment processing. Please refresh in a moment.");
          }
        },
      };

      const razor = new (window as any).Razorpay(options);
      razor.open();
    } catch (error: any) {
      toast.error(error?.response?.data?.msg || "Payment Failed");
    }
  };

  return { startPayment };
};
