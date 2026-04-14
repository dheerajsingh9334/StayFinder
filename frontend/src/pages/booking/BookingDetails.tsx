import React, { useEffect } from "react";
import { useUserBookings } from "../../features/booking/booking.hooks";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useRazorpayPayment } from "../../features/payment/useRazorpayPayment";
import { 
  Calendar, 
  CreditCard,
  CheckCircle, 
  Clock, 
  ChevronLeft,
  MapPin,
  Star,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";

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


  if (isPending) {
    return <Loader size="lg" text="Loading booking details..." />;
  }

  if (!booking) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Calendar size={32} />
        </div>
        <h3 className="empty-state-title">Booking not found</h3>
        <p className="empty-state-description">
          This booking may have been cancelled or doesn't exist.
        </p>
        <Button onClick={() => navigate("/mybooking")}>View All Bookings</Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
      PENDING_PAYMENT: { 
        bg: "#fef3c7", 
        color: "#92400e",
        icon: <Clock size={14} />
      },
      CONFIRMED: { 
        bg: "#dcfce7", 
        color: "#166534",
        icon: <CheckCircle size={14} />
      },
      COMPLETED: { 
        bg: "#dbeafe", 
        color: "#1e40af",
        icon: <CheckCircle size={14} />
      },
      CANCELLED: { 
        bg: "#fee2e2", 
        color: "#991b1b",
        icon: <AlertCircle size={14} />
      },
    };
    const config = statusConfig[status] || statusConfig.PENDING_PAYMENT;
    return (
      <span 
        className="badge"
        style={{ background: config.bg, color: config.color }}
      >
        {config.icon}
        {status.replace("_", " ")}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }} className="text-white min-h-screen">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-ghost text-white/70 hover:text-white"
        style={{ marginBottom: "var(--space-4)" }}
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="rounded-2xl border border-white/10 bg-[#111111] overflow-hidden" style={{ marginBottom: "var(--space-6)" }}>
        {/* Property Image Header */}
        <div style={{ 
          height: "240px", 
          background: "#1a1a1a",
          position: "relative"
        }}>
          {booking.property?.images?.[0] && (
            <img 
              src={booking.property.images[0]} 
              alt={booking.property.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)"
          }} />
          <div style={{
            position: "absolute",
            bottom: "var(--space-4)",
            left: "var(--space-4)",
            right: "var(--space-4)",
            padding: "var(--space-4)",
          }}>
            <h2 
              style={{ fontSize: "1.75rem", fontWeight: "var(--font-bold)", marginBottom: "var(--space-1)", cursor: "pointer", color: "white" }}
              onClick={() => navigate(`/properties/${booking.property.id}`)}
              className="hover:underline"
            >
              {booking.property.title} <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>(View Property)</span>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "rgba(255,255,255,0.7)", fontSize: "var(--text-sm)" }}>
              <MapPin size={14} />
              <span>{booking.property.city}, {booking.property.state}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Status */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "var(--space-6)"
          }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)" }}>
              Booking Details
            </h3>
            {getStatusBadge(booking.status)}
          </div>

          {/* Booking Info Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-6)",
            marginBottom: "var(--space-6)"
          }}>
            <div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", marginBottom: "var(--space-1)", textTransform: "uppercase", fontWeight: "var(--font-medium)" }}>
                Check-in
              </p>
              <p style={{ fontWeight: "var(--font-semibold)", fontSize: "var(--text-base)" }}>
                {formatDate(booking.startDate)}
              </p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)" }}>After 2:00 PM</p>
            </div>
            <div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", marginBottom: "var(--space-1)", textTransform: "uppercase", fontWeight: "var(--font-medium)" }}>
                Check-out
              </p>
              <p style={{ fontWeight: "var(--font-semibold)", fontSize: "var(--text-base)" }}>
                {formatDate(booking.endDate)}
              </p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)" }}>Before 11:00 AM</p>
            </div>
            <div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", marginBottom: "var(--space-1)", textTransform: "uppercase", fontWeight: "var(--font-medium)" }}>
                Guests
              </p>
              <p style={{ fontWeight: "var(--font-semibold)", fontSize: "var(--text-base)" }}>
                {booking.capacity} guest{booking.capacity > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Price Summary */}
          <div style={{ 
            background: "rgba(255,255,255,0.05)", 
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center"
            }}>
              <span style={{ fontWeight: "var(--font-medium)", color: "white" }}>Total Amount</span>
              <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", color: "white" }}>
                ₹{booking.totalPrice?.toLocaleString()}
              </span>
            </div>
            {(booking as any).payments && (booking as any).payments.length > 0 && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>
                   <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Payment Method</span>
                      <span style={{ textTransform: "capitalize", color: "white" }}>{(booking as any).payments[0].provider || 'Unknown'}</span>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Payment ID</span>
                      <span style={{ color: "white" }}>{(booking as any).payments[0].paymentId || 'N/A'}</span>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Payment Status</span>
                      <span style={{ 
                        color: (booking as any).payments[0].status === 'SUCCESS' ? '#34d399' : '#f87171',
                        fontWeight: "500"
                      }}>{(booking as any).payments[0].status || 'UNKNOWN'}</span>
                   </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-6)" }}>
        {booking.status === "PENDING_PAYMENT" && (
          <Button
            onClick={() => startPayment(booking.id)}
            leftIcon={<CreditCard size={18} />}
            size="lg"
          >
            Pay ₹{booking.totalPrice?.toLocaleString()} Now
          </Button>
        )}

        {booking.status === "CONFIRMED" && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-4)",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            borderRadius: "var(--radius-lg)",
            color: "#4ade80",
            width: "100%",
            marginBottom: "1rem"
          }}>
            <CheckCircle size={24} />
            <div>
              <p style={{ fontWeight: "var(--font-semibold)" }}>Booking Confirmed!</p>
              <p style={{ fontSize: "var(--text-sm)", color: "#bbf7d0" }}>Get ready for your stay</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full">
          {booking.status === "COMPLETED" && (
            <Button
              variant="outline"
              leftIcon={<Star size={18} />}
              onClick={() => navigate(`/reviews/create/${booking.property.id}`)}
              className="bg-transparent text-white border-white/20 hover:bg-white/10"
            >
              Write a Review
            </Button>
          )}

        <Button
          variant="outline"
          leftIcon={<MessageCircle size={18} />}
          onClick={() => navigate(`/messages?userId=${booking.property.ownerId ?? ''}`)}
        >
          Message Host
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate("/mybooking")}
        >
          View All Bookings
        </Button>
        </div>
      </div>
    </div>
  );
}
