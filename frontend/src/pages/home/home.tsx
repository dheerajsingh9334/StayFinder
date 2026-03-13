import { useNavigate } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Star, 
  Shield, 
  Clock, 
  Heart, 
  ArrowRight,
  Home as HomeIcon,
  Users,
  Sparkles,
  Building2,
  Compass
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const features = [
  {
    icon: <Shield size={28} />,
    title: "Secure Booking",
    description: "Your payments are protected with industry-leading security"
  },
  {
    icon: <Clock size={28} />,
    title: "Instant Confirmation",
    description: "Get immediate booking confirmations for peace of mind"
  },
  {
    icon: <Heart size={28} />,
    title: "Verified Hosts",
    description: "All our hosts are verified for your safety and comfort"
  }
];

const popularDestinations = [
  { name: "Mumbai", properties: 245, image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400" },
  { name: "Goa", properties: 189, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400" },
  { name: "Delhi", properties: 312, image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400" },
  { name: "Bangalore", properties: 278, image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400" }
];

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <section style={{
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
        color: "white",
        padding: "5rem 1.5rem",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background Pattern */}
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.1,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }} />

        <div className="page-container" style={{ position: "relative" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              marginBottom: "1.5rem"
            }}>
              <Sparkles size={16} />
              Find your perfect stay
            </div>

            <h1 style={{ 
              fontSize: "clamp(2rem, 5vw, 3.5rem)", 
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "1.5rem"
            }}>
              Discover Amazing Places to Stay
            </h1>

            <p style={{ 
              fontSize: "1.125rem", 
              opacity: 0.9, 
              marginBottom: "2.5rem",
              lineHeight: 1.6
            }}>
              From cozy apartments to luxury villas, find the perfect accommodation 
              for your next adventure across India.
            </p>

            {/* Search Bar */}
            <div style={{
              display: "flex",
              gap: "0.75rem",
              padding: "0.75rem",
              backgroundColor: "white",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              flexWrap: "wrap",
              justifyContent: "center"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "var(--radius-lg)",
                flex: "1 1 200px",
                minWidth: "200px"
              }}>
                <MapPin size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <input 
                  type="text"
                  placeholder="Where are you going?"
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    width: "100%",
                    fontSize: "0.95rem",
                    color: "var(--text-primary)"
                  }}
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => navigate("/properties")}
                style={{ padding: "0.875rem 2rem" }}
              >
                <Search size={20} />
                Search
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "3rem",
              marginTop: "3rem",
              flexWrap: "wrap"
            }}>
              {[
                { value: "10K+", label: "Properties" },
                { value: "50K+", label: "Happy Guests" },
                { value: "100+", label: "Cities" }
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stat.value}</div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "5rem 1.5rem", backgroundColor: "var(--bg-secondary)" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Why Choose StayFinder?
            </h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto" }}>
              We make finding and booking your perfect stay simple, secure, and seamless.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem"
          }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card"
                style={{ 
                  textAlign: "center",
                  padding: "2rem"
                }}
              >
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "var(--radius-lg)",
                  background: "linear-gradient(135deg, var(--primary-light), var(--primary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  margin: "0 auto 1.25rem"
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Popular Destinations
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Explore trending places across India
              </p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate("/properties")}>
              View All
              <ArrowRight size={18} />
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem"
          }}>
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
                  transition: "transform 0.3s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <img 
                  src={dest.image} 
                  alt={dest.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)"
                }} />
                <div style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  left: "1.5rem",
                  color: "white"
                }}>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
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
      <section style={{ 
        padding: "5rem 1.5rem",
        background: "linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%)",
        color: "white"
      }}>
        <div className="page-container" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <Building2 size={32} />
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
            {isAuthenticated ? "Start Exploring" : "Ready to Get Started?"}
          </h2>
          <p style={{ 
            color: "rgba(255,255,255,0.8)", 
            maxWidth: "500px", 
            margin: "0 auto 2rem",
            lineHeight: 1.6
          }}>
            {isAuthenticated 
              ? `Welcome back${user?.name ? `, ${user.name}` : ""}! Continue exploring amazing properties.`
              : "Join thousands of travelers finding their perfect stays across India."
            }
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {isAuthenticated ? (
              <>
                <button className="btn btn-primary" onClick={() => navigate("/properties")}>
                  <Compass size={20} />
                  Browse Properties
                </button>
                <button className="btn btn-outline" onClick={() => navigate("/my-bookings")} style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
                  <HomeIcon size={20} />
                  My Bookings
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => navigate("/signup")}>
                  <Users size={20} />
                  Sign Up Free
                </button>
                <button className="btn btn-outline" onClick={() => navigate("/login")} style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
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