import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Search, Star } from "lucide-react";
import Loader from "../../components/ui/Loader";
import {
  useProperties,
  useNearByProperty,
} from "../../features/property/property.hooks";
import { parseSemanticQuery } from "../../services/search.service";
import { useLiveLocation } from "../../hooks/useLiveLocation";
import { useInfinteScroll } from "../../hooks/useInfinteScroll";
import MapView from "../map/MapView";
import type {
  NearByProperty,
  PropertyPayload,
} from "../../features/property/property.types";

export default function LandingPage() {
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState("");
  const [filterScope, setFilterScope] = useState<"both" | "all" | "nearby">(
    "both",
  );
  const location = useLiveLocation();
  const { data: allPropertiesRes, isLoading: isAllLoading } = useProperties(1);
  const { data: nearByRes, isLoading: isNearByLoading } = useNearByProperty(
    location?.lat,
    location?.lng,
  );

  const allProperties = useMemo(
    () => (allPropertiesRes?.data || []) as PropertyPayload[],
    [allPropertiesRes?.data],
  );
  const nearbyProperties = useMemo(
    () => (nearByRes?.data || []) as NearByProperty[],
    [nearByRes?.data],
  );

  const semantic = useMemo(() => parseSemanticQuery(filterText), [filterText]);

  const semanticTerms = useMemo(
    () =>
      [
        semantic.rewrittenQuery,
        ...(semantic.keywords || []),
        semantic.extractedFilters.city || "",
      ]
        .join(" ")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [semantic],
  );

  const matchesSemantic = useMemo(
    () => (text: string) => {
      if (!semanticTerms.length) return true;
      return semanticTerms.some((term) => text.includes(term));
    },
    [semanticTerms],
  );

  const filteredAll = useMemo(() => {
    if (!filterText.trim()) return allProperties;

    return allProperties.filter((property) => {
      const haystack =
        `${property.title || ""} ${property.city || ""} ${property.state || ""}`.toLowerCase();
      return matchesSemantic(haystack);
    });
  }, [allProperties, filterText, matchesSemantic]);

  const filteredNearBy = useMemo(() => {
    return nearbyProperties;
  }, [nearbyProperties]);

  const fallbackNearbyProperties = useMemo(
    () =>
      filteredAll.map((property) => ({
        id: property.id,
        title: property.title,
        price: property.price,
        state: property.state,
        city: property.city,
        lat: property.lat ?? null,
        lng: property.lng ?? null,
        images: property.images ?? [],
        averageRating: property.averageRating ?? 0,
        availability: property.availability ?? [],
      })) as NearByProperty[],
    [filteredAll],
  );

  const effectiveNearbyProperties = location
    ? filteredNearBy
    : fallbackNearbyProperties;

  const allMapProperties = useMemo(
    () =>
      filteredAll
        .map((property) => ({
          id: property.id,
          title: property.title,
          price: property.price,
          state: property.state,
          city: property.city,
          lat: property.lat ?? null,
          lng: property.lng ?? null,
          images: property.images ?? [],
          averageRating: property.averageRating ?? 0,
          availability: property.availability ?? [],
        }))
        .filter(
          (property) =>
            Number.isFinite(Number(property.lat)) &&
            Number.isFinite(Number(property.lng)),
        ) as NearByProperty[],
    [filteredAll],
  );

  const nearbyMapProperties = useMemo(
    () =>
      effectiveNearbyProperties.filter(
        (property) =>
          Number.isFinite(Number(property.lat)) &&
          Number.isFinite(Number(property.lng)),
      ),
    [effectiveNearbyProperties],
  );

  const mergedMapProperties = useMemo(() => {
    const byId = new Map<string, NearByProperty>();
    [...allMapProperties, ...nearbyMapProperties].forEach((property) => {
      byId.set(property.id, property);
    });
    return Array.from(byId.values());
  }, [allMapProperties, nearbyMapProperties]);

  const mapFocus = mergedMapProperties[0];
  const [visibleAllCount, setVisibleAllCount] = useState(10);
  const [visibleNearbyCount, setVisibleNearbyCount] = useState(10);

  const resetVisibleCounts = () => {
    setVisibleAllCount(10);
    setVisibleNearbyCount(10);
  };

  const loadMoreAll = useCallback(() => {
    setVisibleAllCount((prev) => Math.min(prev + 10, filteredAll.length));
  }, [filteredAll.length]);

  const loadMoreNearby = useCallback(() => {
    setVisibleNearbyCount((prev) =>
      Math.min(prev + 10, effectiveNearbyProperties.length),
    );
  }, [effectiveNearbyProperties.length]);

  const allHasMore = visibleAllCount < filteredAll.length;
  const nearbyHasMore = visibleNearbyCount < effectiveNearbyProperties.length;

  const allSentinelRef = useInfinteScroll({
    hasMore: filterScope !== "nearby" && allHasMore,
    isLoading: isAllLoading,
    onLoadMore: loadMoreAll,
  });

  const nearbySentinelRef = useInfinteScroll({
    hasMore: filterScope !== "all" && nearbyHasMore,
    isLoading: isNearByLoading,
    onLoadMore: loadMoreNearby,
  });

  const visibleAllProperties = useMemo(
    () => filteredAll.slice(0, visibleAllCount),
    [filteredAll, visibleAllCount],
  );

  const visibleNearbyProperties = useMemo(
    () => effectiveNearbyProperties.slice(0, visibleNearbyCount),
    [effectiveNearbyProperties, visibleNearbyCount],
  );

  const renderFeaturedCard = (
    property: PropertyPayload | NearByProperty | undefined,
    badgeText: string,
  ) => {
    if (!property) return null;

    const coverImage =
      property.images?.[0] ||
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";
    const locationText = [property.city, property.state]
      .filter(Boolean)
      .join(", ");

    return (
      <article className="landing-featured-card">
        <img
          src={coverImage}
          alt={property.title}
          className="landing-featured-image"
        />

        <div className="landing-featured-content">
          <span className="landing-featured-badge">{badgeText}</span>

          <h4 className="landing-featured-title">{property.title}</h4>

          <p className="landing-featured-location">
            <MapPin size={14} />
            {locationText || "Location unavailable"}
          </p>

          <div className="landing-featured-meta">
            <span className="landing-featured-price">
              ₹{Number(property.price || 0).toLocaleString()} / night
            </span>
            <span className="landing-featured-rating">
              <Star size={14} />
              {Number(property.averageRating || 0) > 0
                ? Number(property.averageRating).toFixed(1)
                : "New"}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/properties/${property.id}`)}
          >
            View details
          </button>
        </div>
      </article>
    );
  };

  return (
    <>
      <div className="landing-page relative min-h-[calc(100vh-80px)]">
        <div className="landing-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hero-content"
          >
            <h1 className="hero-title">
              Find Your Perfect Stay, <br />
              <span className="text-gradient">Anywhere in the World</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="hero-subtitle"
            >
              Discover handpicked properties with transparent pricing and
              exceptional hosts. Experience travel exactly the way you want,
              with the design precision of a workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="hero-buttons"
            >
              <Link
                to="/properties"
                className="btn btn-primary btn-lg hero-btn"
              >
                Explore Properties
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <section className="landing-discovery-wrap">
        <div className="landing-container">
          <section className="landing-discovery-section">
            <div className="landing-discovery-header">
              <h2 className="landing-discovery-title">Find Your Stay Faster</h2>
              <p className="landing-discovery-subtitle">
                Filter and explore all listings plus nearby recommendations.
              </p>
            </div>

            <div className="landing-filter-bar">
              <Search size={18} />
              <input
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  resetVisibleCounts();
                }}
                placeholder="Semantic search: family stay in delhi under 4000"
                aria-label="Filter properties"
              />
            </div>

            <div className="landing-filter-row">
              <div className="landing-filter-meta">
                Semantic intent: <strong>{semantic.intent}</strong>
              </div>
              <div className="landing-filter-scope">
                <button
                  type="button"
                  className={`landing-filter-chip ${filterScope === "both" ? "active" : ""}`}
                  onClick={() => {
                    setFilterScope("both");
                    resetVisibleCounts();
                  }}
                >
                  Both
                </button>
                <button
                  type="button"
                  className={`landing-filter-chip ${filterScope === "all" ? "active" : ""}`}
                  onClick={() => {
                    setFilterScope("all");
                    resetVisibleCounts();
                  }}
                >
                  All only
                </button>
                <button
                  type="button"
                  className={`landing-filter-chip ${filterScope === "nearby" ? "active" : ""}`}
                  onClick={() => {
                    setFilterScope("nearby");
                    resetVisibleCounts();
                  }}
                >
                  Nearby only
                </button>
              </div>
            </div>

            <div className="landing-map-shell">
              <div
                className="landing-list-header"
                style={{ marginBottom: "var(--space-3)" }}
              >
                <h3>Map View (All + Nearby)</h3>
                <span>{mergedMapProperties.length}</span>
              </div>
              <div className="landing-map-frame">
                {mergedMapProperties.length > 0 ? (
                  <MapView
                    properties={mergedMapProperties}
                    userLat={location?.lat}
                    userLng={location?.lng}
                    focusLat={mapFocus?.lat ?? undefined}
                    focusLng={mapFocus?.lng ?? undefined}
                  />
                ) : (
                  <div className="landing-map-fallback">
                    No mappable properties available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="landing-property-split">
              {filterScope !== "nearby" && (
                <div>
                  <div className="landing-list-header">
                    <h3>All Properties</h3>
                    <span>
                      {visibleAllProperties.length} / {filteredAll.length}
                    </span>
                  </div>

                  {isAllLoading ? (
                    <Loader size="md" text="Loading properties..." />
                  ) : filteredAll.length === 0 ? (
                    <p className="landing-empty-copy">
                      No properties match this filter.
                    </p>
                  ) : (
                    <div className="landing-property-grid landing-property-grid-single">
                      {visibleAllProperties.map((property) =>
                        renderFeaturedCard(property, "All listing"),
                      )}
                      <div
                        ref={allSentinelRef}
                        className="landing-scroll-sentinel"
                      />
                    </div>
                  )}
                </div>
              )}

              {filterScope !== "all" && (
                <div>
                  <div className="landing-list-header">
                    <h3>Nearby</h3>
                    <span>
                      {visibleNearbyProperties.length} /{" "}
                      {effectiveNearbyProperties.length}
                    </span>
                  </div>

                  {location && isNearByLoading ? (
                    <Loader size="md" text="Loading nearby stays..." />
                  ) : effectiveNearbyProperties.length === 0 ? (
                    <p className="landing-empty-copy">
                      No nearby or fallback properties found for this filter.
                    </p>
                  ) : (
                    <div
                      className="landing-property-grid landing-property-grid-single"
                      style={{ gap: "var(--space-4)" }}
                    >
                      {!location && (
                        <p className="landing-empty-copy">
                          Showing filtered stays until live location is enabled.
                        </p>
                      )}
                      {visibleNearbyProperties.map((property) =>
                        renderFeaturedCard(property, "Nearby pick"),
                      )}
                      <div
                        ref={nearbySentinelRef}
                        className="landing-scroll-sentinel"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
