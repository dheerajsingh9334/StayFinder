import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "../../features/property/property.hooks";
import { useFavorites, useToggleFavorite } from "../../features/favorites/favorites.hooks";
import { Search, SlidersHorizontal } from "lucide-react";
import PropertyCard from "../../components/property/PropertyCard";
import Loader from "../../components/ui/Loader";
import NearBy from "./NearBy";
import { useInfinteScroll } from "../../hooks/useInfinteScroll";
import type { PropertyPayload } from "../../features/property/property.types";

export default function PropertyList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<PropertyPayload[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { data: favoriteList } = useFavorites();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { data, isLoading, isError, isFetching } = useProperties(page);

  useEffect(() => {
    if (!data) return;

    setTotal(data.total);
    setTotalPage(data.totalPage);
    setAllItems((prev) => {
      if (page === 1) return data.data;
      const seen = new Set(prev.map((item) => item.id));
      return [...prev, ...data.data.filter((item) => !seen.has(item.id))];
    });
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (isFetching || page >= totalPage) return;
    setPage((p) => p + 1);
  }, [isFetching, page, totalPage]);

  const sentinelRef = useInfinteScroll({
    hasMore: page < totalPage,
    isLoading: isFetching,
    onLoadMore: loadMore,
  });

  if (isLoading && page === 1) {
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
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  const items = allItems;

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <h1 className="page-title">Discover Amazing Stays</h1>
            <p className="page-subtitle">{total} properties available</p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/search")}
          >
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
                    isFavorite={favoriteList?.has(property.id) ?? false}
                    onFavorite={(id) => toggleFavorite({ propertyId: id, isFavorite: favoriteList?.has(id) ?? false })}
                    onClick={() => navigate(`/properties/${property.id}`)}
                  />
                ))}
              </div>

              <div ref={sentinelRef} style={{ height: 1 }} />
              {(isFetching || page < totalPage) && (
                <div
                  style={{
                    marginTop: "var(--space-5)",
                    textAlign: "center",
                    color: "var(--gray-500)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {isFetching
                    ? "Loading more properties..."
                    : "Scroll to load more"}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar - Nearby Map */}
        <div className="sidebar">
          <div
            style={{
              padding: "var(--space-4)",
              borderBottom: "1px solid var(--gray-100)",
            }}
          >
            <h3
              style={{
                fontSize: "var(--text-base)",
                fontWeight: "var(--font-semibold)",
              }}
            >
              Properties near you
            </h3>
          </div>
          <NearBy />
        </div>
      </div>
    </>
  );
}
