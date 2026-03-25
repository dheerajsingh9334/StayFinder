import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { logout } from "../../features/auth/auth.slice";
import UpdateProfile from "./updateProfile";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  Key,
  Building2,
  Calendar,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";

export const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isloading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  if (isloading) {
    return <Loader size="lg" text="Loading your profile..." />;
  }

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <User size={32} />
        </div>
        <h3 className="empty-state-title">No profile data</h3>
        <p className="empty-state-description">
          Please log in to view your profile
        </p>
        <Button onClick={() => navigate("/login")}>Log in</Button>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleChangePassword = () => {
    navigate("/account/changepassword");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, { bg: string; color: string }> = {
      HOST: { bg: "var(--primary-100)", color: "var(--primary-700)" },
      ADMIN: { bg: "#fee2e2", color: "#991b1b" },
      USER: { bg: "rgba(213, 137, 27, 0.2)", color: "var(--gray-300)" },
    };
    const style = roleStyles[role] || roleStyles.USER;
    return (
      <span
        className="badge"
        style={{ background: style.bg, color: style.color }}
      >
        <Shield size={12} />
        {role}
      </span>
    );
  };

  return (
    <div className="profile-section">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} />
          ) : (
            getInitials(user.name)
          )}
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <div className="profile-role">{getRoleBadge(user.role)}</div>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="profile-card">
        <h3 className="profile-card-title">Account Information</h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "var(--gray-100)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--gray-500)",
              }}
            >
              <User size={20} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--gray-500)",
                  marginBottom: "2px",
                }}
              >
                Full Name
              </p>
              <p style={{ fontWeight: "var(--font-medium)" }}>{user.name}</p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "var(--gray-100)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--gray-500)",
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--gray-500)",
                  marginBottom: "2px",
                }}
              >
                Email Address
              </p>
              <p style={{ fontWeight: "var(--font-medium)" }}>{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "var(--gray-100)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gray-500)",
                }}
              >
                <Phone size={20} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--gray-500)",
                    marginBottom: "2px",
                  }}
                >
                  Phone Number
                </p>
                <p style={{ fontWeight: "var(--font-medium)" }}>{user.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Profile */}
      <div className="profile-card">
        <h3 className="profile-card-title">Update Profile</h3>
        <UpdateProfile />
      </div>

      {/* Quick Actions */}
      <div className="profile-card">
        <h3 className="profile-card-title">Quick Actions</h3>
        <div className="profile-actions">
          <Button
            variant="secondary"
            onClick={() => navigate("/mybooking")}
            leftIcon={<Calendar size={18} />}
          >
            My Bookings
          </Button>

          {user.role === "HOST" && (
            <Button
              variant="secondary"
              onClick={() => navigate("/Myproperty")}
              leftIcon={<Building2 size={18} />}
            >
              My Properties
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={handleChangePassword}
            leftIcon={<Key size={18} />}
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Logout */}
      <div
        className="profile-card"
        style={{
          background: "var(--primary-50)",
          border: "1px solid var(--primary-100)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h4
              style={{
                fontWeight: "var(--font-semibold)",
                marginBottom: "var(--space-1)",
              }}
            >
              Sign out
            </h4>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>
              Sign out from your account on this device
            </p>
          </div>
          <Button
            variant="danger"
            onClick={handleLogout}
            leftIcon={<LogOut size={18} />}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
