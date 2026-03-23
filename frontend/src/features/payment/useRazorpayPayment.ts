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
          const loadingToastId = toast.loading("Confirming your booking...");

          if (!refetchBooking) {
            toast.dismiss(loadingToastId);
            toast("Payment is being processed. Please check your bookings.");
            navigate("/mybooking");
            return;
          }

          let attempts = 0;
          const maxAttempts = 10;

          const checkStatus = async () => {
            const res = await refetchBooking();
            const bookings = Array.isArray(res?.data?.booking)
              ? res.data.booking
              : [];
            const updated = bookings.find((b: any) => b.id === bookingId);
            return updated?.status === BookingStatus.CONFIRMED;
          };

          try {
            const confirmed = await checkStatus();
            if (confirmed) {
              toast.dismiss(loadingToastId);
              toast.success("Payment successful 🎉");
              navigate("/mybooking");
              return;
            }
          } catch {
            // Continue with interval polling fallback.
          }

          const interval = setInterval(async () => {
            attempts++;

            try {
              const confirmed = await checkStatus();

              if (confirmed) {
                clearInterval(interval);
                toast.dismiss(loadingToastId);
                toast.success("Payment successful 🎉");
                navigate("/mybooking");
                return;
              }

              if (attempts >= maxAttempts) {
                clearInterval(interval);
                toast.dismiss(loadingToastId);
                toast(
                  "Payment is being processed. Please check your bookings.",
                );
              }
            } catch {
              clearInterval(interval);
              toast.dismiss(loadingToastId);
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
