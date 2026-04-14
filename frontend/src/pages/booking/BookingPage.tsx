import React, { useEffect, useState } from "react";
import type { CreateBookingPayload } from "../../features/booking/booking.types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateBooking } from "../../features/booking/booking.hooks";
import toast from "react-hot-toast";
import { Calendar, Users, ArrowRight, ChevronLeft, Shield } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const toLocalDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minStartDate = toLocalDateInput(tomorrow);
  const todayLocal = toLocalDateInput(today);

  useEffect(() => {
    if (isError) {
      const err = error as any;
      const message =
        err?.response?.data?.msg || err?.message || "Booking failed";
      toast.error(message, { id: "create-Booking" });
    }
    if (isSuccess && data?.booking?.id) {
      toast.success("Booking created! Complete payment to confirm.");
      navigate(`/booking/${data.booking.id}`, { replace: true });
    }
  }, [isError, isSuccess, error, data, navigate]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.propertyId) {
      toast.error(
        "Property not found for booking. Please retry from property page.",
      );
      navigate("/", { replace: true });
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (form.startDate < minStartDate) {
      toast.error("Check-in must be at least tomorrow");
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }
    createBooking.mutate(form);
  };

  return (
    <div className="page-container flex justify-center py-12">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost text-white/70 hover:text-white mb-6 p-0"
        >
          <ChevronLeft size={20} className="mr-2 inline" />
          Back to listing
        </button>

        <div className="rounded-3xl border border-white/10 bg-black/40 p-8 shadow-xl backdrop-blur-md">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-white tracking-tight">Confirm Reservation</h2>
            <p className="text-white/60 mt-2">Specify your dates and party size to reserve your stay.</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-8">
            {/* Dates Card */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-white uppercase tracking-widest">
                <Calendar size={18} /> Schedule
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Check-in Date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  disabled={isPending}
                  min={minStartDate}
                />
                <Input
                  type="date"
                  label="Check-out Date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  disabled={isPending}
                  min={form.startDate || todayLocal}
                />
              </div>
            </div>

            {/* Guests Card */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-white uppercase tracking-widest">
                <Users size={18} /> Party Size
              </h4>
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-white/80">Number of guests</span>
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 disabled:opacity-50 transition"
                    onClick={() => setForm({ ...form, capacity: Math.max(1, form.capacity - 1) })}
                    disabled={form.capacity <= 1 || isPending}
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold text-white min-w-[20px] text-center">{form.capacity}</span>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 disabled:opacity-50 transition"
                    onClick={() => setForm({ ...form, capacity: form.capacity + 1 })}
                    disabled={isPending}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Security Box */}
            <div className="flex items-start gap-4 p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <Shield size={24} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-200 mb-1">Encrypted Transaction</p>
                <p className="text-xs text-blue-300 leading-relaxed">
                  Your reservation is securely staged. You will be redirected to our payment gateway to complete and finalize the transaction.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-white/10 mt-6">
              <p className="text-sm text-white/50 text-center md:text-left">No funds will be captured yet.</p>
              <Button type="submit" isLoading={isPending} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white" rightIcon={<ArrowRight size={18} />}>
                Proceed to Checkout
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
