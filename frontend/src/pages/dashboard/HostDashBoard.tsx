import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { 
  Building2, 
  TrendingUp, 
  Calendar, 
  IndianRupee,
  Plus,
  Eye,
  Settings,
  Star,
  Users,
  ArrowUpRight,
  BarChart3,
  Home
} from "lucide-react";

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    { 
      label: "Total Properties", 
      value: "0", 
      icon: <Building2 size={24} />,
      color: "var(--primary)",
      bgColor: "var(--primary-light)"
    },
    { 
      label: "Total Bookings", 
      value: "0", 
      icon: <Calendar size={24} />,
      color: "var(--success)",
      bgColor: "#dcfce7"
    },
    { 
      label: "Total Revenue", 
      value: "₹0", 
      icon: <IndianRupee size={24} />,
      color: "var(--warning)",
      bgColor: "#fef3c7"
    },
    { 
      label: "Average Rating", 
      value: "0.0", 
      icon: <Star size={24} />,
      color: "#8b5cf6",
      bgColor: "#ede9fe"
    }
  ];

  const quickActions = [
    { 
      title: "Add New Property", 
      description: "List a new property for guests",
      icon: <Plus size={24} />,
      path: "/property/create",
      primary: true
    },
    { 
      title: "View My Properties", 
      description: "Manage your listed properties",
      icon: <Building2 size={24} />,
      path: "/owner/properties"
    },
    { 
      title: "Booking Requests", 
      description: "View and manage bookings",
      icon: <Calendar size={24} />,
      path: "/my-bookings"
    },
    { 
      title: "View Analytics", 
      description: "Track your performance",
      icon: <BarChart3 size={24} />,
      path: "#"
    }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
          <Home size={16} />
          Dashboard
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          Welcome back, {user?.name || "Host"}!
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Here's an overview of your hosting activity
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem"
      }}>
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: stat.bgColor,
              color: stat.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
          Quick Actions
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem"
        }}>
          {quickActions.map((action) => (
            <div
              key={action.title}
              onClick={() => navigate(action.path)}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                border: action.primary ? "2px solid var(--primary)" : undefined,
                backgroundColor: action.primary ? "var(--primary-light)" : undefined
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: action.primary ? "var(--primary)" : "var(--bg-secondary)",
                color: action.primary ? "white" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                {action.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontWeight: 600, 
                  marginBottom: "0.125rem",
                  color: action.primary ? "var(--primary-dark)" : undefined
                }}>
                  {action.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {action.description}
                </p>
              </div>
              <ArrowUpRight size={20} style={{ color: "var(--text-tertiary)" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="card" style={{ 
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
        color: "white"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Ready to start hosting?
            </h3>
            <p style={{ opacity: 0.9 }}>
              List your first property and start earning today.
            </p>
          </div>
          <button 
            className="btn"
            onClick={() => navigate("/property/create")}
            style={{ 
              backgroundColor: "white", 
              color: "var(--primary)",
              fontWeight: 600
            }}
          >
            <Plus size={18} />
            Create Listing
          </button>
        </div>
      </div>
    </div>
  );
}