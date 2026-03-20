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
          toast.loading("Confirming your booking...");

          if (!refetchBooking) return;

          let attempts = 0;
          const maxAttempts = 6;

          const interval = setInterval(async () => {
            attempts++;

            try {
              const res = await refetchBooking();
              const updated = res.data?.booking;

              if (updated?.status === BookingStatus.CONFIRMED) {
                clearInterval(interval);
                toast.dismiss();
                toast.success("Payment successful 🎉");
                navigate("/mybooking");
              }

              if (attempts >= maxAttempts) {
                clearInterval(interval);
                toast.dismiss();
                toast(
                  "Payment is being processed. Please check your bookings.",
                );
              }
            } catch (err) {
              clearInterval(interval);
              toast.dismiss();
              toast.error("Error verifying payment");
            }
          }, 2000); // every 2 sec
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
