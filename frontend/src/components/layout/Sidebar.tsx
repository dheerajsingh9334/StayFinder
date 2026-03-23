import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  Home,
  User,
  Calendar,
  Building2,
  PlusCircle,
  Settings,
  HelpCircle,
  MapPin,
  Search,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Explore", public: true },
    { path: "/search", icon: Search, label: "Search", public: true },
    { path: "/nearby", icon: MapPin, label: "Nearby", public: true },
    { path: "/profile", icon: User, label: "Profile", auth: true },
    { path: "/mybooking", icon: Calendar, label: "My Bookings", auth: true },
    { path: "/host-panel", icon: Building2, label: "Host Panel", role: "HOST" },
    {
      path: "/host-dashboard",
      icon: Calendar,
      label: "Host Dashboard",
      role: "HOST",
    },
    {
      path: "/Myproperty",
      icon: Building2,
      label: "My Properties",
      role: "HOST",
    },
    {
      path: "/CreateProperty",
      icon: PlusCircle,
      label: "List Property",
      role: "HOST",
    },
  ];

  const filteredItems = navItems.filter((item) => {
    if (item.public) return true;
    if (item.auth && isAuthenticated) return true;
    if (item.role && user?.role === item.role) return true;
    return false;
  });

  return (
    <aside
      style={{
        width: "260px",
        height: "calc(100vh - 65px)",
        position: "sticky",
        top: "65px",
        background: "var(--white)",
        borderRight: "1px solid var(--gray-100)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform var(--transition-base)",
      }}
    >
      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          {filteredItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-lg)",
                  color: isActive(item.path)
                    ? "var(--primary-600)"
                    : "var(--gray-600)",
                  background: isActive(item.path)
                    ? "var(--primary-50)"
                    : "transparent",
                  fontWeight: isActive(item.path)
                    ? "var(--font-medium)"
                    : "var(--font-normal)",
                  fontSize: "var(--text-sm)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div
        style={{
          borderTop: "1px solid var(--gray-100)",
          paddingTop: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        <Link
          to="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-lg)",
            color: "var(--gray-600)",
            fontSize: "var(--text-sm)",
            transition: "all var(--transition-fast)",
          }}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <Link
          to="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-lg)",
            color: "var(--gray-600)",
            fontSize: "var(--text-sm)",
            transition: "all var(--transition-fast)",
          }}
        >
          <HelpCircle size={20} />
          <span>Help & Support</span>
        </Link>
      </div>
    </aside>
  );
}
