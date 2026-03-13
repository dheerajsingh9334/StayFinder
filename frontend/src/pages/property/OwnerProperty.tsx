import { useNavigate } from "react-router-dom";
import { useOwnerProperties } from "../../features/property/property.hooks";
import { useState } from "react";
import { Loader } from "../../components/ui/Loader";
import { 
  Plus, 
  MapPin, 
  IndianRupee, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  Eye,
  Edit,
  LayoutGrid
} from "lucide-react";

export default function OwnerProperty() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, isFetching } = useOwnerProperties(page);

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Building2 size={64} style={{ color: "var(--danger)", margin: "0 auto 1rem" }} />
        <h2 style={{ marginBottom: "0.5rem" }}>Error Loading Properties</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { data: items, totalPage } = data;

  if (!items.length) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Building2 size={64} style={{ color: "var(--text-tertiary)", margin: "0 auto 1rem" }} />
        <h2 style={{ marginBottom: "0.5rem" }}>No Properties Listed</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Start hosting by creating your first property listing
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/property/create")}>
          <Plus size={18} />
          Create Property
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LayoutGrid size={28} />
            My Properties
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage your {items.length} listed propert{items.length > 1 ? "ies" : "y"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/property/create")}>
          <Plus size={18} />
          Add Property
        </button>
      </div>

      {/* Fetching Indicator */}
      {isFetching && !isLoading && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          padding: "0.75rem 1rem",
          backgroundColor: "var(--primary-light)",
          borderRadius: "var(--radius-md)",
          marginBottom: "1rem",
          fontSize: "0.875rem",
          color: "var(--primary)"
        }}>
          <Loader size="sm" />
          Updating...
        </div>
      )}

      {/* Property Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
        gap: "1.5rem" 
      }}>
        {items.map((property) => (
          <div 
            key={property.id} 
            className="card"
            style={{ 
              overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            {/* Image */}
            <div 
              style={{ 
                height: "180px",
                margin: "-1.5rem -1.5rem 1rem",
                backgroundImage: property.images[0] ? `url(${property.images[0]})` : "linear-gradient(135deg, var(--gray-200), var(--gray-300))",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                padding: "0.75rem"
              }}
            >
              {!property.images[0] && (
                <div style={{ 
                  position: "absolute", 
                  top: "50%", 
                  left: "50%", 
                  transform: "translate(-50%, -50%)",
                  color: "var(--text-tertiary)"
                }}>
                  <Building2 size={48} />
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem", lineHeight: 1.3 }}>
                {property.title}
              </h3>
              
              <p style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.375rem", 
                color: "var(--text-secondary)", 
                fontSize: "0.875rem",
                marginBottom: "0.75rem"
              }}>
                <MapPin size={14} />
                {property.city}, {property.state}
              </p>

              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--border-light)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 700, fontSize: "1.125rem" }}>
                  <IndianRupee size={18} />
                  {property.price.toLocaleString("en-IN")}
                  <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--text-secondary)" }}>/night</span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/properties/${property.id}`);
                    }}
                    title="View Property"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/properties/${property.id}?edit=true`);
                    }}
                    title="Edit Property"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPage > 1 && (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          gap: "1rem",
          marginTop: "2rem",
          paddingTop: "2rem",
          borderTop: "1px solid var(--border-light)"
        }}>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem"
          }}>
            <span style={{ fontWeight: 600 }}>Page {page}</span>
            <span style={{ color: "var(--text-tertiary)" }}>of</span>
            <span style={{ fontWeight: 600 }}>{totalPage}</span>
          </div>

          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPage}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
