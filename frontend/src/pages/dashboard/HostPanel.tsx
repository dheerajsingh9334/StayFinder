import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  Plus,
  Star,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { propertyServices } from "../../services/property.services";
import { BookingServices } from "../../services/booking.service";
import type { PropertyPayload } from "../../features/property/property.types";
import { api } from "../../services/api";

type HostBooking = {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  user?: { name?: string; email?: string };
  property?: { id?: string; title?: string };
};

export default function HostPanel() {
  const [properties, setProperties] = useState<PropertyPayload[]>([]);
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const ownerRes = await propertyServices.getOwnerProperty(1);
        const ownerProperties = Array.isArray(ownerRes.data?.data)
          ? ownerRes.data.data
          : [];
        setProperties(ownerProperties);

        const bookingResults = await Promise.all(
          ownerProperties.slice(0, 8).map(async (p: PropertyPayload) => {
            const res = await BookingServices.getPropertyBookings(p.id);
            if (Array.isArray(res.data?.bookings)) return res.data.bookings;
            if (Array.isArray(res.data?.booking)) return res.data.booking;
            return [];
          }),
        );

        const merged = bookingResults.flat().filter(Boolean).slice(0, 20);
        setBookings(merged);

        // Load conversations for host messaging view
        try {
          const convRes = await api.get("/message/conversations");
          setConversations(convRes.data?.conversations || []);
        } catch { /* silent */ }
      } catch {
        toast.error("Failed to load host panel details");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter(
        (b) =>
          String(b.status).toUpperCase() === "CONFIRMED" ||
          String(b.status).toUpperCase() === "COMPLETED",
      )
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const avgRating = totalProperties
      ? properties.reduce((sum, p) => sum + (p.averageRating || 0), 0) /
        totalProperties
      : 0;

    return { totalProperties, totalBookings, totalRevenue, avgRating };
  }, [bookings, properties]);

  if (loading) {
    return <div className="page-container">Loading host panel...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Host Panel</h1>
        <p className="page-subtitle">All host details in one place</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div className="card card-body">
          <Building2 size={18} />
          <h3>Total Properties</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>
            {stats.totalProperties}
          </p>
        </div>
        <div className="card card-body">
          <CalendarDays size={18} />
          <h3>Total Bookings</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>
            {stats.totalBookings}
          </p>
        </div>
        <div className="card card-body">
          <CircleDollarSign size={18} />
          <h3>Total Revenue</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="card card-body">
          <Star size={18} />
          <h3>Average Rating</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>
            {stats.avgRating.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="card card-body" style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ marginTop: 0 }}>Host Quick Actions</h2>
        <div
          style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}
        >
          <Link to="/CreateProperty" className="btn btn-primary">
            <Plus size={16} />
            Create Property
          </Link>
          <Link to="/Myproperty" className="btn btn-secondary">
            My Properties
          </Link>
          <Link to="/host-dashboard" className="btn btn-secondary">
            Host Dashboard
          </Link>
          <Link to="/reviews" className="btn btn-secondary">
            Reviews
          </Link>
          <Link to="/notifications" className="btn btn-secondary">
            Notifications
          </Link>
          <Link to="/messages" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <MessageCircle size={14} /> Messages
          </Link>
        </div>
      </div>


      <div className="card card-body">
        <h2 style={{ marginTop: 0 }}>Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings found yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px" }}>
                    Property
                  </th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Guest</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Dates</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    style={{ borderTop: "1px solid var(--gray-100)" }}
                  >
                    <td style={{ padding: "8px" }}>
                      {b.property?.title || "Property"}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {b.user?.name || "Guest"}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {new Date(b.startDate).toLocaleDateString()} -{" "}
                      {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "8px" }}>
                      ₹{(b.totalPrice || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "8px" }}>{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Messages Section */}
      <div className="card card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MessageCircle size={20} /> Guest Messages
          </h2>
          <Link to="/messages" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {conversations.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>No guest messages yet. Guests can message you from your property pages.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {conversations.slice(0, 5).map((conv: any) => (
              <Link
                key={conv.user.id}
                to={`/messages?userId=${conv.user.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  background: "var(--gray-50)",
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {conv.user.avatarUrl
                    ? <img src={conv.user.avatarUrl} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} alt="" />
                    : conv.user.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", margin: 0 }}>{conv.user.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>
                <MessageCircle size={16} style={{ color: "var(--primary-600)", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
