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
        background: "var(--gray-900)",
        color: "var(--gray-300)",
        marginTop: "auto",
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
                color: "var(--white)",
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
              }}
            >
              Find your perfect stay anywhere in the world. Premium properties,
              exceptional experiences.
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <a
                href="#"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "var(--gray-800)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gray-400)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "var(--gray-800)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gray-400)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "var(--gray-800)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gray-400)",
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
                color: "var(--white)",
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
                    color: "var(--gray-400)",
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
                    color: "var(--gray-400)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Nearby
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  style={{
                    color: "var(--gray-400)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Top Destinations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  style={{
                    color: "var(--gray-400)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Host */}
          <div>
            <h4
              style={{
                color: "var(--white)",
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
                    color: "var(--gray-400)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  List Your Property
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  style={{
                    color: "var(--gray-400)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Host Resources
                </a>
              </li>
              <li>
                <a
                  href="#"
                  style={{
                    color: "var(--gray-400)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Responsible Hosting
                </a>
              </li>
              <li>
                <a
                  href="#"
                  style={{
                    color: "var(--gray-400)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Community Forum
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                color: "var(--white)",
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
                  color: "var(--gray-400)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <Mail size={16} />
                <span>support@stayfinder.com</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  color: "var(--gray-400)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <Phone size={16} />
                <span>+91 1234 567 890</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-2)",
                  color: "var(--gray-400)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <MapPin size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          style={{
            borderTop: "1px solid var(--gray-800)",
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
            © {currentYear} StayFinder. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "var(--space-6)" }}>
            <a
              href="#"
              style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)" }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)" }}
            >
              Terms of Service
            </a>
            <a
              href="#"
              style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)" }}
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
