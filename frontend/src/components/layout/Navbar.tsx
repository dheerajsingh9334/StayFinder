import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { logout } from "../../features/auth/auth.slice";
import {
  Home,
  Search,
  User,
  LogOut,
  PlusCircle,
  Building2,
  Calendar,
  Menu,
  X,
  Heart,
  Bell,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
    navigate("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isLandingPage = location.pathname === "/";

  return (
    <nav className={`navbar ${isLandingPage ? "navbar-overlay" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <Home size={28} />
          <span className="navbar-logo-block">
            <strong>StayFinder</strong>
            <small>Book smart, stay better.</small>
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <form
          className="search-bar navbar-search"
          onSubmit={handleSearchSubmit}
        >
          <Search size={18} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search destinations, properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Navigation Links - Desktop */}
        <div className="navbar-nav">
          <Link
            to="/"
            className={`navbar-link ${isActive("/") ? "active" : ""}`}
          >
            Explore
          </Link>
          <Link
            to="/search"
            className={`navbar-link ${isActive("/search") ? "active" : ""}`}
          >
            Search
          </Link>
          {user?.role === "HOST" && (
            <>
              <Link
                to="/host-panel"
                className={`navbar-link ${isActive("/host-panel") ? "active" : ""}`}
              >
                Host Panel
              </Link>
              <Link
                to="/Myproperty"
                className={`navbar-link ${isActive("/Myproperty") ? "active" : ""}`}
              >
                My Properties
              </Link>
              <Link
                to="/CreateProperty"
                className={`navbar-link ${isActive("/CreateProperty") ? "active" : ""}`}
              >
                <PlusCircle size={16} style={{ marginRight: "4px" }} />
                List Property
              </Link>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {isAuthenticated && user ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <Link
                to="/favorites"
                className="btn btn-icon btn-ghost"
                title="Favorites"
              >
                <Heart size={20} />
              </Link>
              <Link
                to="/notifications"
                className="btn btn-icon btn-ghost"
                title="Notifications"
              >
                <Bell size={20} />
              </Link>

              <div
                className={`dropdown ${isDropdownOpen ? "open" : ""}`}
                ref={dropdownRef}
                style={{ marginLeft: "var(--space-2)" }}
              >
                <div
                  className="navbar-avatar"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>

                <div className="dropdown-menu">
                  <div
                    style={{
                      padding: "var(--space-3) var(--space-4)",
                      borderBottom: "1px solid var(--gray-100)",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: "var(--font-semibold)",
                        color: "var(--gray-50)",
                        marginBottom: "2px",
                      }}
                    >
                      {user.name}
                    </p>
                    <p
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--gray-500)",
                      }}
                    >
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User size={16} />
                    Profile
                  </Link>

                  <Link
                    to="/mybooking"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Calendar size={16} />
                    My Bookings
                  </Link>

                  {user.role === "HOST" && (
                    <>
                      <Link
                        to="/host-panel"
                        className="dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Building2 size={16} />
                        Host Panel
                      </Link>
                      <Link
                        to="/Myproperty"
                        className="dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Building2 size={16} />
                        My Properties
                      </Link>
                    </>
                  )}

                  <div className="dropdown-divider" />

                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="navbar-auth-actions">
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ display: "none" }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(17, 13, 10, 0.8)",
            borderTop: "1px solid rgba(213, 137, 27, 0.24)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.35)",
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <Link
            to="/"
            className="navbar-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Explore
          </Link>
          <Link
            to="/search"
            className="navbar-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Search
          </Link>
          {user?.role === "HOST" && (
            <>
              <Link
                to="/host-panel"
                className="navbar-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Host Panel
              </Link>
              <Link
                to="/Myproperty"
                className="navbar-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Properties
              </Link>
              <Link
                to="/CreateProperty"
                className="navbar-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                List Property
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
