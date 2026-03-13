import React, { useEffect, useState } from "react";
import type { CreateBookingPayload } from "../../features/booking/booking.types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateBooking } from "../../features/booking/booking.hooks";
import toast from "react-hot-toast";
import { Calendar, Users, ArrowRight, ChevronLeft, Shield } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

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
      toast.success("Booking created! Complete payment to confirm.");
      navigate(`/booking/${data.booking.id}`, { replace: true });
    }
  }, [isError, isSuccess, error, data, navigate]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }
    createBooking.mutate(form);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-ghost"
        style={{ marginBottom: "var(--space-4)" }}
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="card" style={{ overflow: "visible" }}>
        <div className="card-header">
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-bold)" }}>
            Complete your booking
          </h2>
          <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)", marginTop: "var(--space-1)" }}>
            Fill in the details below to reserve your stay
          </p>
        </div>
        
        <form onSubmit={handleCreate}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {/* Dates */}
            <div>
              <h4 style={{ 
                fontSize: "var(--text-sm)", 
                fontWeight: "var(--font-semibold)", 
                marginBottom: "var(--space-3)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)"
              }}>
                <Calendar size={18} />
                Select your dates
              </h4>
              <div className="form-row">
                <Input
                  type="date"
                  label="Check-in"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  disabled={isPending}
                  min={new Date().toISOString().split("T")[0]}
                />
                <Input
                  type="date"
                  label="Check-out"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  disabled={isPending}
                  min={form.startDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Guests */}
            <div>
              <h4 style={{ 
                fontSize: "var(--text-sm)", 
                fontWeight: "var(--font-semibold)", 
                marginBottom: "var(--space-3)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)"
              }}>
                <Users size={18} />
                Number of guests
              </h4>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "var(--space-4)",
                padding: "var(--space-4)",
                background: "var(--gray-50)",
                borderRadius: "var(--radius-lg)"
              }}>
                <button
                  type="button"
                  className="booking-guests-btn"
                  onClick={() => setForm({ ...form, capacity: Math.max(1, form.capacity - 1) })}
                  disabled={form.capacity <= 1 || isPending}
                >
                  -
                </button>
                <span style={{ 
                  fontSize: "var(--text-xl)", 
                  fontWeight: "var(--font-semibold)",
                  minWidth: "40px",
                  textAlign: "center"
                }}>
                  {form.capacity}
                </span>
                <button
                  type="button"
                  className="booking-guests-btn"
                  onClick={() => setForm({ ...form, capacity: form.capacity + 1 })}
                  disabled={isPending}
                >
                  +
                </button>
                <span style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>
                  guest{form.capacity > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
              background: "var(--primary-50)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--primary-100)"
            }}>
              <Shield size={20} style={{ color: "var(--primary-600)", flexShrink: 0 }} />
              <div>
                <p style={{ 
                  fontSize: "var(--text-sm)", 
                  fontWeight: "var(--font-medium)",
                  color: "var(--primary-700)",
                  marginBottom: "var(--space-1)"
                }}>
                  Secure booking
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--primary-600)" }}>
                  Your payment is protected. You'll be redirected to complete the payment after confirming.
                </p>
              </div>
            </div>
          </div>

          <div className="card-footer" style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)" }}>
              You won't be charged yet
            </p>
            <Button 
              type="submit" 
              isLoading={isPending}
              rightIcon={<ArrowRight size={18} />}
            >
              Confirm Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
