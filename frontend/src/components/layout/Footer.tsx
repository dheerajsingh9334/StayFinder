import { Link } from "react-router-dom";
import {
  Home,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--gray-100)",
        color: "var(--gray-500)",
        marginTop: "auto",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "var(--space-12) var(--space-6)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-8)",
          }}
        >
          {/* Brand Section */}
          <div>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                color: "var(--primary-700)",
                fontSize: "var(--text-xl)",
                fontWeight: "var(--font-bold)",
                marginBottom: "var(--space-4)",
              }}
            >
              <Home size={28} />
              <span>StayFinder</span>
            </Link>
            <p
              style={{
                fontSize: "var(--text-sm)",
                lineHeight: "var(--leading-relaxed)",
                marginBottom: "var(--space-4)",
                color: "var(--gray-500)",
              }}
            >
              Experience the world's most luxurious properties. Masterfully
              curated, exceptionally designed just for you.
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-700)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-700)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-700)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                color: "var(--gray-600)",
                fontSize: "var(--text-base)",
                fontWeight: "var(--font-semibold)",
                marginBottom: "var(--space-4)",
              }}
            >
              Explore
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <li>
                <Link
                  to="/"
                  style={{
                    color: "var(--gray-500)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  All Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/nearby"
                  style={{
                    color: "var(--gray-500)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Nearby Locations
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  style={{
                    color: "var(--gray-500)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Smart Semantic Search
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  style={{
                    color: "var(--gray-500)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Authentic Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Host */}
          <div>
            <h4
              style={{
                color: "var(--gray-600)",
                fontSize: "var(--text-base)",
                fontWeight: "var(--font-semibold)",
                marginBottom: "var(--space-4)",
              }}
            >
              Hosting
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <li>
                <Link
                  to="/CreateProperty"
                  style={{
                    color: "var(--gray-500)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  List Your Property
                </Link>
              </li>
              <li>
                <Link
                  to="/host-dashboard"
                  style={{
                    color: "var(--gray-500)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Host Command Center
                </Link>
              </li>
              <li>
                <Link
                  to="/host-panel"
                  style={{
                    color: "var(--gray-500)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Resources & Panels
                </Link>
              </li>
              <li>
                <Link
                  to="/mybooking"
                  style={{
                    color: "var(--gray-500)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Manage Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                color: "var(--gray-600)",
                fontSize: "var(--text-base)",
                fontWeight: "var(--font-semibold)",
                marginBottom: "var(--space-4)",
              }}
            >
              Contact
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  color: "var(--gray-500)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <Mail size={16} color="var(--primary-700)" />
                <span>concierge@stayfinder.luxury</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  color: "var(--gray-500)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <Phone size={16} color="var(--primary-700)" />
                <span>+1 800 LUX-STAY</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-2)",
                  color: "var(--gray-500)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <MapPin
                  size={16}
                  color="var(--primary-700)"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <span>100 Premium Blvd, New York, US</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          style={{
            borderTop: "1px solid var(--gray-100)",
            marginTop: "var(--space-8)",
            paddingTop: "var(--space-6)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--space-4)",
          }}
        >
          <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)" }}>
            © {currentYear} StayFinder Ultra-Premium. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "var(--space-6)" }}>
            <Link
              to="/privacy"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--gray-500)",
                textDecoration: "none",
              }}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--gray-500)",
                textDecoration: "none",
              }}
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--gray-500)",
                textDecoration: "none",
              }}
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
