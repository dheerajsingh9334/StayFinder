import React, { useEffect, useState } from "react";
import type { CreateBookingPayload } from "../../features/booking/booking.types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateBooking } from "../../features/booking/booking.hooks";
import toast from "react-hot-toast";

export default function BookingPage() {
  const [params] = useSearchParams();
  const propertyId = params.get("propertyId");

  const createBooking = useCreateBooking();
  const { isPending, isSuccess, isError, error, data } = createBooking;
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateBookingPayload>({
    propertyId: propertyId || "",
    startDate: "",
    endDate: "",
    capacity: 1,
  });

  useEffect(() => {
    if (isError) {
      const message = (error as any)?.response?.data?.msg || "Booking failed";

      toast.error(message, { id: "create-Booking" });
    }
    if (isSuccess && data?.booking?.id) {
      toast.success("booking Created , Complete Payment");
      navigate(`/booking/${data.booking.id}`, { replace: true });
    }
  }, [isError, isSuccess, error, data, navigate]);

  const handleCreate = () => {
    if (!form.startDate || !form.endDate) {
      toast.error("Select valid dates");
      return;
    }
    createBooking.mutate(form);
  };
  return (
    <div>
      <h2>Create Booking</h2>

      <input
        type="date"
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        disabled={isPending}
      />

      <input
        type="date"
        value={form.endDate}
        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        disabled={isPending}
      />

      <input
        type="number"
        min={1}
        value={form.capacity}
        onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
        disabled={isPending}
      />

      <button onClick={handleCreate} disabled={isPending}>
        {isPending ? "Creating..." : "Confirm Booking"}
      </button>
    </div>
  );
}
