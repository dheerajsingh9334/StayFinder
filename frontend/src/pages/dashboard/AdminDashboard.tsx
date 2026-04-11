import { useEffect, useState } from "react";
import { Users, Building2, TrendingUp, AlertCircle } from "lucide-react";
import Loader from "../../components/ui/Loader";
import { api } from "../../services/api";
import toast from "react-hot-toast";

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  reportedIssues: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true);
      const [propertiesRes, bookingsRes, usersRes] = await Promise.allSettled([
        api.get("/property?page=1"),
        api.get("/booking/my-booking"),
        api.get("/admin/users"),
      ]);

      const totalProperties =
        propertiesRes.status === "fulfilled"
          ? Number(propertiesRes.value.data?.total || 0)
          : 0;

      const bookingList =
        bookingsRes.status === "fulfilled"
          ? bookingsRes.value.data?.booking || []
          : [];

      const totalBookings = Array.isArray(bookingList) ? bookingList.length : 0;
      const totalRevenue = Array.isArray(bookingList)
        ? bookingList.reduce(
            (sum: number, b: any) => sum + Number(b.totalPrice || 0),
            0,
          )
        : 0;

      const totalUsers =
        usersRes.status === "fulfilled"
          ? usersRes.value.data?.users?.length || 0
          : 0;

      setStats({
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue,
        reportedIssues: 0,
      });
    } catch {
      toast.error("Failed to load admin dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader size="lg" text="Loading admin dashboard..." />;
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
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and management</p>
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
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
            />
            <StatCard
              icon={Building2}
              label="Total Properties"
              value={stats.totalProperties}
            />
            <StatCard
              icon={TrendingUp}
              label="Total Bookings"
              value={stats.totalBookings}
            />
            {stats.reportedIssues > 0 && (
              <StatCard
                icon={AlertCircle}
                label="Reported Issues"
                value={stats.reportedIssues}
              />
            )}
          </>
        )}
      </div>

      {/* Info Cards */}
      <div className="card">
        <h2
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: "700",
            marginBottom: "var(--space-4)",
          }}
        >
          Platform Management
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <a
            href="/admin-dashboard/users"
            className="card"
            style={{
              textDecoration: "none",
              cursor: "pointer",
              padding: "var(--space-4)",
              textAlign: "center",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Users
              size={32}
              style={{
                color: "var(--accent-blue)",
                marginBottom: "var(--space-3)",
                margin: "0 auto",
              }}
            />
            <p style={{ fontWeight: "600" }}>Manage Users</p>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--gray-500)",
                marginTop: "var(--space-2)",
              }}
            >
              View and manage all users
            </p>
          </a>

          <a
            href="/admin-dashboard/properties"
            className="card"
            style={{
              textDecoration: "none",
              cursor: "pointer",
              padding: "var(--space-4)",
              textAlign: "center",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Building2
              size={32}
              style={{
                color: "var(--accent-emerald)",
                marginBottom: "var(--space-3)",
                margin: "0 auto",
              }}
            />
            <p style={{ fontWeight: "600" }}>Manage Properties</p>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--gray-500)",
                marginTop: "var(--space-2)",
              }}
            >
              Approve/reject properties
            </p>
          </a>

          <a
            href="#"
            className="card"
            style={{
              textDecoration: "none",
              cursor: "pointer",
              padding: "var(--space-4)",
              textAlign: "center",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <AlertCircle
              size={32}
              style={{
                color: "var(--error)",
                marginBottom: "var(--space-3)",
                margin: "0 auto",
              }}
            />
            <p style={{ fontWeight: "600" }}>View Reports</p>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--gray-500)",
                marginTop: "var(--space-2)",
              }}
            >
              Handle reported issues
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
