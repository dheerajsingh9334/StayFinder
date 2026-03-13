import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { 
  Users, 
  Building2, 
  Calendar, 
  IndianRupee,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  FileText,
  Home
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    { 
      label: "Total Users", 
      value: "0", 
      change: "+0%",
      icon: <Users size={24} />,
      color: "var(--primary)",
      bgColor: "var(--primary-light)"
    },
    { 
      label: "Total Properties", 
      value: "0", 
      change: "+0%",
      icon: <Building2 size={24} />,
      color: "var(--success)",
      bgColor: "#dcfce7"
    },
    { 
      label: "Total Bookings", 
      value: "0", 
      change: "+0%",
      icon: <Calendar size={24} />,
      color: "var(--warning)",
      bgColor: "#fef3c7"
    },
    { 
      label: "Total Revenue", 
      value: "₹0", 
      change: "+0%",
      icon: <IndianRupee size={24} />,
      color: "#8b5cf6",
      bgColor: "#ede9fe"
    }
  ];

  const recentActivity = [
    { type: "user", message: "New user registration", time: "Just now", icon: <Users size={16} /> },
    { type: "booking", message: "New booking confirmed", time: "5 min ago", icon: <CheckCircle size={16} /> },
    { type: "property", message: "New property listed", time: "1 hour ago", icon: <Building2 size={16} /> },
    { type: "payment", message: "Payment received", time: "2 hours ago", icon: <IndianRupee size={16} /> }
  ];

  const quickLinks = [
    { title: "Manage Users", icon: <Users size={20} />, path: "#" },
    { title: "Manage Properties", icon: <Building2 size={20} />, path: "/properties" },
    { title: "View Bookings", icon: <Calendar size={20} />, path: "/my-bookings" },
    { title: "Reports", icon: <FileText size={20} />, path: "#" },
    { title: "Analytics", icon: <BarChart3 size={20} />, path: "#" },
    { title: "Settings", icon: <Settings size={20} />, path: "#" }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
          <Shield size={16} />
          Admin Dashboard
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          Welcome, {user?.name || "Admin"}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Platform overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem"
      }}>
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="card"
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: stat.bgColor,
                color: stat.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {stat.icon}
              </div>
              <span style={{ 
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--success)",
                backgroundColor: "#dcfce7",
                padding: "0.25rem 0.5rem",
                borderRadius: "9999px"
              }}>
                <TrendingUp size={12} />
                {stat.change}
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
              {stat.label}
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 700 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Recent Activity</h2>
            <Clock size={18} style={{ color: "var(--text-tertiary)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {recentActivity.map((activity, index) => (
              <div 
                key={index}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  padding: "0.75rem",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {activity.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>{activity.message}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Quick Links</h2>
            <Home size={18} style={{ color: "var(--text-tertiary)" }} />
          </div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.75rem"
          }}>
            {quickLinks.map((link) => (
              <button
                key={link.title}
                onClick={() => navigate(link.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary-light)";
                  e.currentTarget.style.borderColor = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-light)";
                }}
              >
                <span style={{ color: "var(--primary)" }}>{link.icon}</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{link.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "var(--success)",
              boxShadow: "0 0 8px var(--success)"
            }} />
            <div>
              <p style={{ fontWeight: 600 }}>System Status: Operational</p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>All services running normally</p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm">
            <Settings size={16} />
            System Settings
          </button>
        </div>
      </div>
    </div>
  );
}