import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "../../features/property/property.hooks";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import PropertyCard from "../../components/property/PropertyCard";
import Loader from "../../components/ui/Loader";
import NearBy from "./NearBy";

export default function PropertyList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useProperties(page);

  if (isLoading) {
    return <Loader size="lg" text="Finding the best stays for you..." />;
  }

  if (isError || !data) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Search size={32} />
        </div>
        <h3 className="empty-state-title">Unable to load properties</h3>
        <p className="empty-state-description">
          We couldn't fetch the properties. Please try again later.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  const { data: items, totalPage, total } = data;

  const handlePrev = () => {
    if (page > 1) setPage((p: number) => p - 1);
  };
  
  const handleNext = () => {
    if (page < totalPage) setPage((p) => p + 1);
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
          <div>
            <h1 className="page-title">Discover Amazing Stays</h1>
            <p className="page-subtitle">{total} properties available</p>
          </div>
          <button className="btn btn-secondary">
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>
      </div>

      <div className="layout">
        {/* Property Grid */}
        <div>
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={32} />
              </div>
              <h3 className="empty-state-title">No properties found</h3>
              <p className="empty-state-description">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="list">
                {items.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={() => navigate(`/properties/${property.id}`)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button 
                  className="pagination-btn" 
                  onClick={handlePrev} 
                  disabled={page === 1}
                >
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPage) }, (_, i) => {
                  let pageNum;
                  if (totalPage <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPage - 2) {
                    pageNum = totalPage - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <span className="pagination-info">
                  of {totalPage}
                </span>
                
                <button 
                  className="pagination-btn" 
                  onClick={handleNext} 
                  disabled={page === totalPage}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar - Nearby Map */}
        <div className="sidebar">
          <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--gray-100)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)" }}>
              Properties near you
            </h3>
          </div>
          <NearBy />
        </div>
      </div>
    </>
  );
}
