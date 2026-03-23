import { useEffect, useState } from "react";
import { HomeIcon, Calendar, DollarSign, AlertCircle } from "lucide-react";
import Loader from "../../components/ui/Loader";
import { api } from "../../services/api";
import toast from "react-hot-toast";

interface DashboardStats {
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  availableRooms: number;
  pendingBookings: number;
}

interface RecentBooking {
  id: string;
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  amount: number;
}

interface OwnerPropertyLite {
  id: string;
  title: string;
  capacity: number;
}

export default function HostDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const propertiesRes = await api.get("/property/owner/me?page=1");
      const properties =
        (propertiesRes.data?.data as OwnerPropertyLite[] | undefined) || [];

      let totalBookings = 0;
      let totalRevenue = 0;
      let pendingBookings = 0;
      const flattened: RecentBooking[] = [];

      await Promise.all(
        properties.map(async (property) => {
          try {
            const bookingRes = await api.get(
              `/booking/getBooking/${property.id}`,
            );
            const bookings = bookingRes.data?.getBooking || [];
            totalBookings += bookings.length;
            bookings.forEach((b: any) => {
              totalRevenue += Number(b.totalPrice || 0);
              if (b.status === "PENDING_PAYMENT") pendingBookings += 1;
              flattened.push({
                id: b.id,
                guestName: b.user?.name || b.user?.email || "Guest",
                propertyName: property.title,
                checkIn: b.startDate,
                checkOut: b.endDate,
                status: b.status,
                amount: Number(b.totalPrice || 0),
              });
            });
          } catch {
            // Continue loading dashboard even if one property's bookings fail.
          }
        }),
      );

      setStats({
        totalProperties: properties.length,
        totalBookings,
        totalRevenue,
        availableRooms: properties.reduce(
          (sum, property) => sum + Number(property.capacity || 0),
          0,
        ),
        pendingBookings,
      });

      setRecentBookings(
        flattened
          .sort(
            (a, b) =>
              new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime(),
          )
          .slice(0, 5),
      );
    } catch (error: unknown) {
      const err = error as any;
      toast.error(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader size="lg" text="Loading your dashboard..." />;
  }

  const StatCard = ({ icon: Icon, label, value }: any) => (
    <div
      className="card"
      style={{ display: "flex", gap: "var(--space-4)", alignItems: "start" }}
    >
      <div
        style={{
          padding: "var(--space-3)",
          background: "var(--primary-50)",
          borderRadius: "var(--radius-md)",
          color: "var(--primary-600)",
        }}
      >
        <Icon size={24} />
      </div>
      <div>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--gray-500)",
            marginBottom: "var(--space-2)",
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: "var(--text-2xl)", fontWeight: "700" }}>
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Host Dashboard</h1>
        <p className="page-subtitle">Manage your properties and bookings</p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}
      >
        {stats && (
          <>
            <StatCard
              icon={HomeIcon}
              label="Total Properties"
              value={stats.totalProperties}
            />
            <StatCard
              icon={Calendar}
              label="Total Bookings"
              value={stats.totalBookings}
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
            />
            <StatCard
              icon={AlertCircle}
              label="Pending Bookings"
              value={stats.pendingBookings}
            />
          </>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div style={{ marginBottom: "var(--space-4)" }}>
          <h2
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "700",
              marginBottom: "var(--space-2)",
            }}
          >
            Recent Bookings
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)" }}>
            Latest 5 bookings from your properties
          </p>
        </div>

        {recentBookings.length === 0 ? (
          <p
            style={{
              color: "var(--gray-500)",
              textAlign: "center",
              padding: "var(--space-6)",
            }}
          >
            No recent bookings
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                  <th
                    style={{
                      padding: "var(--space-3)",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "var(--text-sm)",
                      color: "var(--gray-600)",
                    }}
                  >
                    Guest
                  </th>
                  <th
                    style={{
                      padding: "var(--space-3)",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "var(--text-sm)",
                      color: "var(--gray-600)",
                    }}
                  >
                    Property
                  </th>
                  <th
                    style={{
                      padding: "var(--space-3)",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "var(--text-sm)",
                      color: "var(--gray-600)",
                    }}
                  >
                    Dates
                  </th>
                  <th
                    style={{
                      padding: "var(--space-3)",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "var(--text-sm)",
                      color: "var(--gray-600)",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      padding: "var(--space-3)",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "var(--text-sm)",
                      color: "var(--gray-600)",
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    style={{ borderBottom: "1px solid var(--gray-100)" }}
                  >
                    <td
                      style={{
                        padding: "var(--space-3)",
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {booking.guestName}
                    </td>
                    <td
                      style={{
                        padding: "var(--space-3)",
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {booking.propertyName}
                    </td>
                    <td
                      style={{
                        padding: "var(--space-3)",
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        padding: "var(--space-3)",
                        fontSize: "var(--text-sm)",
                        fontWeight: "600",
                      }}
                    >
                      ₹{Number(booking.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "var(--space-3)" }}>
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: "600",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background:
                            booking.status === "confirmed"
                              ? "var(--success)"
                              : booking.status === "pending"
                                ? "var(--warning)"
                                : "var(--error)",
                          color: "var(--white)",
                        }}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
