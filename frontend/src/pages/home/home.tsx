import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Shield,
  Clock,
  Heart,
  ArrowRight,
  Home as HomeIcon,
  Users,
  Sparkles,
  Building2,
  Compass,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const features = [
  {
    icon: <Shield size={28} />,
    title: "Secure Booking",
    description: "Your payments are protected with industry-leading security",
  },
  {
    icon: <Clock size={28} />,
    title: "Instant Confirmation",
    description: "Get immediate booking confirmations for peace of mind",
  },
  {
    icon: <Heart size={28} />,
    title: "Verified Hosts",
    description: "All our hosts are verified for your safety and comfort",
  },
];

const popularDestinations = [
  {
    name: "Mumbai",
    properties: 245,
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400",
  },
  {
    name: "Goa",
    properties: 189,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400",
  },
  {
    name: "Delhi",
    properties: 312,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400",
  },
  {
    name: "Bangalore",
    properties: 278,
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        style={{
          background:
            "radial-gradient(circle at 18% 20%, rgba(213,137,27,0.22) 0%, rgba(25,31,18,0.94) 34%, rgba(11,40,42,0.9) 100%)",
          color: "white",
          padding: "5rem 1.5rem 4.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.45,
            background:
              "radial-gradient(circle at 80% 25%, rgba(20,138,136,0.35), transparent 35%), radial-gradient(circle at 25% 75%, rgba(213,137,27,0.26), transparent 38%)",
          }}
        />

        <div className="page-container" style={{ position: "relative" }}>
          <div
            style={{
              maxWidth: "920px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.45rem 1rem",
                borderRadius: 999,
                fontSize: "0.82rem",
                marginBottom: "1.4rem",
                letterSpacing: 0.3,
                border: "1px solid rgba(255,255,255,0.24)",
                background: "rgba(255,255,255,0.09)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Sparkles size={16} />
              Transparent Dual Experience
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                gap: "0.9rem",
                flexWrap: "wrap",
                marginBottom: "1.35rem",
              }}
            >
              <div
                style={{
                  minWidth: 240,
                  padding: "1.05rem 1.4rem",
                  borderRadius: "var(--radius-2xl)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  textAlign: "left",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  Stay
                </p>
                <h1
                  style={{
                    margin: "0.4rem 0 0",
                    fontSize: "clamp(2rem, 4vw, 3.3rem)",
                    lineHeight: 1,
                    color: "#f8fafc",
                  }}
                >
                  Stay
                </h1>
              </div>

              <div
                style={{
                  minWidth: 240,
                  padding: "1.05rem 1.4rem",
                  borderRadius: "var(--radius-2xl)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(20,184,166,0.17)",
                  backdropFilter: "blur(8px)",
                  textAlign: "left",
                  transform: "translateY(16px)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  Finder
                </p>
                <h1
                  style={{
                    margin: "0.4rem 0 0",
                    fontSize: "clamp(2rem, 4vw, 3.3rem)",
                    lineHeight: 1,
                    color: "#ccfbf1",
                  }}
                >
                  Finder
                </h1>
              </div>
            </div>

            <p
              style={{
                fontSize: "1.08rem",
                opacity: 0.92,
                marginBottom: "2.1rem",
                lineHeight: 1.7,
                maxWidth: 720,
                marginInline: "auto",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              StayFinder blends two transparent layers: one for discovery, one
              for trust. Search by city, vibe, or budget and find a stay that
              actually matches your plan.
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                padding: "0.8rem",
                borderRadius: "var(--radius-2xl)",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.12)",
                boxShadow: "0 16px 35px rgba(0,0,0,0.3)",
                flexWrap: "wrap",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  flex: "1 1 220px",
                  minWidth: "220px",
                }}
              >
                <MapPin
                  size={20}
                  style={{ color: "var(--secondary-700)", flexShrink: 0 }}
                />
                <input
                  type="text"
                  placeholder="Try Goa, Delhi or Bangalore"
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    width: "100%",
                    fontSize: "0.95rem",
                    color: "var(--secondary-900)",
                  }}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/search")}
                style={{
                  padding: "0.9rem 2rem",
                  borderRadius: "var(--radius-xl)",
                }}
              >
                <Search size={20} />
                Search
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "2.7rem",
                marginTop: "2.25rem",
                flexWrap: "wrap",
              }}
            >
              {[
                { value: "10K+", label: "Properties" },
                { value: "50K+", label: "Happy Guests" },
                { value: "100+", label: "Cities" },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "1.7rem",
                      fontWeight: 800,
                      color: "#f8fafc",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "0.82rem", opacity: 0.82 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: "5rem 1.5rem",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              Why Choose StayFinder?
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              We make finding and booking your perfect stay simple, secure, and
              seamless.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="card"
                style={{
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "var(--radius-lg)",
                    background:
                      "linear-gradient(135deg, var(--primary-light), var(--primary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    margin: "0 auto 1.25rem",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div className="page-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                Popular Destinations
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Explore trending places across India
              </p>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/properties")}
            >
              View All
              <ArrowRight size={18} />
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {popularDestinations.map((dest) => (
              <div
                key={dest.name}
                onClick={() => navigate(`/properties?city=${dest.name}`)}
                style={{
                  position: "relative",
                  height: "280px",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.5rem",
                    left: "1.5rem",
                    color: "white",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {dest.name}
                  </h3>
                  <p style={{ opacity: 0.9, fontSize: "0.875rem" }}>
                    {dest.properties} properties
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "5rem 1.5rem",
          background:
            "linear-gradient(135deg, rgba(17,13,10,0.85) 0%, rgba(11,40,42,0.82) 100%)",
          color: "white",
        }}
      >
        <div className="page-container" style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <Building2 size={32} />
          </div>
          <h2
            style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}
          >
            {isAuthenticated ? "Start Exploring" : "Ready to Get Started?"}
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              maxWidth: "500px",
              margin: "0 auto 2rem",
              lineHeight: 1.6,
            }}
          >
            {isAuthenticated
              ? `Welcome back${user?.name ? `, ${user.name}` : ""}! Continue exploring amazing properties.`
              : "Join thousands of travelers finding their perfect stays across India."}
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {isAuthenticated ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/properties")}
                >
                  <Compass size={20} />
                  Browse Properties
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate("/my-bookings")}
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "white",
                  }}
                >
                  <HomeIcon size={20} />
                  My Bookings
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/signup")}
                >
                  <Users size={20} />
                  Sign Up Free
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate("/login")}
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "white",
                  }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
