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
  AlertCircle
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

  useEffect(() => {
    if (booking?.status === "CONFIRMED") {
      toast.success("Booking Confirmed! 🎉");
      navigate("/mybooking");
    }
  }, [booking?.status, navigate]);

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
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-ghost"
        style={{ marginBottom: "var(--space-4)" }}
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        {/* Property Image Header */}
        <div style={{ 
          height: "200px", 
          background: "var(--gray-100)",
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
            bottom: "var(--space-4)",
            left: "var(--space-4)",
            right: "var(--space-4)",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)"
          }}>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-bold)", marginBottom: "var(--space-1)" }}>
              {booking.property.title}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>
              <MapPin size={14} />
              <span>{booking.property.city}, {booking.property.state}</span>
            </div>
          </div>
        </div>

        <div className="card-body">
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
            background: "var(--gray-50)", 
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center"
            }}>
              <span style={{ fontWeight: "var(--font-medium)" }}>Total Amount</span>
              <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)" }}>
                ₹{booking.totalPrice?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
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
            background: "#dcfce7",
            borderRadius: "var(--radius-lg)",
            color: "#166534"
          }}>
            <CheckCircle size={24} />
            <div>
              <p style={{ fontWeight: "var(--font-semibold)" }}>Booking Confirmed!</p>
              <p style={{ fontSize: "var(--text-sm)" }}>Get ready for your stay</p>
            </div>
          </div>
        )}

        {booking.status === "COMPLETED" && (
          <Button 
            variant="outline" 
            leftIcon={<Star size={18} />}
          >
            Write a Review
          </Button>
        )}

        <Button 
          variant="secondary"
          onClick={() => navigate("/mybooking")}
        >
          View All Bookings
        </Button>
      </div>
    </div>
  );
}
