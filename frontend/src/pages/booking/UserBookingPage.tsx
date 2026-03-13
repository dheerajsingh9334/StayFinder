import { useUserBookings } from "../../features/booking/booking.hooks";
import { useNavigate } from "react-router-dom";
import { BookingStatus } from "../../features/booking/booking.types";
import { useRazorpayPayment } from "../../features/payment/useRazorpayPayment";
import { Loader } from "../../components/ui/Loader";
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Ticket,
  Home
} from "lucide-react";

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  [BookingStatus.PENDING_PAYMENT]: { 
    color: "var(--warning)", 
    icon: <AlertCircle size={16} />, 
    label: "Payment Pending" 
  },
  [BookingStatus.CONFIRMED]: { 
    color: "var(--success)", 
    icon: <CheckCircle size={16} />, 
    label: "Confirmed" 
  },
  [BookingStatus.CANCELLED]: { 
    color: "var(--danger)", 
    icon: <XCircle size={16} />, 
    label: "Cancelled" 
  },
  [BookingStatus.COMPLETED]: { 
    color: "var(--primary)", 
    icon: <CheckCircle size={16} />, 
    label: "Completed" 
  },
};

export default function MyBooking() {
  const { data, isError, isLoading } = useUserBookings();
  const { startPayment } = useRazorpayPayment();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <XCircle size={64} style={{ color: "var(--danger)", margin: "0 auto 1rem" }} />
        <h2 style={{ marginBottom: "0.5rem" }}>Failed to Load Bookings</h2>
        <p style={{ color: "var(--text-secondary)" }}>Please try again later</p>
      </div>
    );
  }

  if (!data?.booking.length) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Ticket size={64} style={{ color: "var(--text-tertiary)", margin: "0 auto 1rem" }} />
        <h2 style={{ marginBottom: "0.5rem" }}>No Bookings Yet</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Start exploring properties and book your next stay!
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/properties")}>
          <Home size={18} />
          Browse Properties
        </button>
      </div>
    );
  }

  const { booking: items } = data;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    return `${days} night${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>My Bookings</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {items.length} booking{items.length > 1 ? 's' : ''} total
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {items.map((booking) => {
          const status = statusConfig[booking.status] || statusConfig[BookingStatus.PENDING_PAYMENT];
          
          return (
            <div 
              key={booking.id} 
              className="card"
              style={{ 
                display: "grid",
                gridTemplateColumns: booking.property.images?.[0] ? "180px 1fr" : "1fr",
                gap: "1.5rem",
                overflow: "hidden"
              }}
            >
              {booking.property.images?.[0] && (
                <div 
                  style={{ 
                    backgroundImage: `url(${booking.property.images[0]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "var(--radius-md)",
                    minHeight: "140px"
                  }}
                />
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: !booking.property.images?.[0] ? "0" : "0.5rem 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      {booking.property.title}
                    </h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <MapPin size={14} />
                      {booking.property.city}, {booking.property.state}
                    </p>
                  </div>

                  <span 
                    style={{ 
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.375rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: `${status.color}15`,
                      color: status.color
                    }}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.875rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
                    <Calendar size={16} />
                    <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
                    <Clock size={16} />
                    <span>{getDuration(booking.startDate, booking.endDate)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid var(--border-light)" }}>
                  <div style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                    ₹{booking.totalPrice.toLocaleString("en-IN")}
                  </div>
                  
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {booking.status === BookingStatus.PENDING_PAYMENT && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => startPayment(booking.id)}
                      >
                        <CreditCard size={16} />
                        Pay Now
                      </button>
                    )}
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/booking/${booking.id}`)}
                    >
                      <Eye size={16} />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
