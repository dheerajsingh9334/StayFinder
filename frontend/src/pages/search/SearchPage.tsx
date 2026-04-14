import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Brain, Filter, Sparkles, Search, WandSparkles } from "lucide-react";
import toast from "react-hot-toast";
import PropertyCard from "../../components/property/PropertyCard";
import NearBy from "../property/NearBy";
import {
  searchService,
  type SearchFilters,
  type SemanticParseResult,
} from "../../services/search.service";
import type { PropertyPayload } from "../../features/property/property.types";
import { useInfinteScroll } from "../../hooks/useInfinteScroll";
import Button from "../../components/ui/Button";

type SearchMode = "normal" | "ai" | "semantic";

type ActiveSearch = {
  mode: SearchMode;
  query: string;
  filters: SearchFilters;
  semanticSeed?: {
    rewrittenQuery: string;
    mergedFilters: SearchFilters;
  };
};

const PAGE_SIZE = 10;

function useInitialQuery() {
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  return params.get("q") || "";
}

export default function SearchPage() {
  const navigate = useNavigate();
  const initialQuery = useInitialQuery();

  const [query, setQuery] = useState(initialQuery);

  // Auto-search on mount if query exists (Fixes reload)
  useEffect(() => {
    if (initialQuery && !hasSearched && !isLoading) {
      void runSearch();
    }
  }, []); // Only on mount
  const [mode, setMode] = useState<SearchMode>("semantic");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [results, setResults] = useState<PropertyPayload[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [semanticInfo, setSemanticInfo] = useState<SemanticParseResult | null>(
    null,
  );
  const [activeSearch, setActiveSearch] = useState<ActiveSearch | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    city: "",
    minPrice: undefined,
    maxPrice: undefined,
    capacity: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    sortBy: "newest",
  });

  const executeSearch = useCallback(
    async (
      active: ActiveSearch,
      targetPage: number,
      append: boolean,
      semanticSeed?: ActiveSearch["semanticSeed"],
    ) => {
      const loadingSetter = append ? setIsLoadingMore : setIsLoading;
      loadingSetter(true);

      try {
        let response: any;
        let nextSemanticSeed = semanticSeed;

        if (active.mode === "semantic") {
          if (targetPage === 1) {
            response = await searchService.semanticSearch(
              active.query,
              active.filters,
              {
                page: 1,
                limit: PAGE_SIZE,
              },
            );
            setSemanticInfo(response.semantic);
            nextSemanticSeed = {
              rewrittenQuery: response.semantic.rewrittenQuery,
              mergedFilters: {
                ...response.semantic.extractedFilters,
                ...active.filters,
              },
            };
          } else {
            response = await searchService.normalSearch(
              semanticSeed?.rewrittenQuery || active.query,
              semanticSeed?.mergedFilters || active.filters,
              { page: targetPage, limit: PAGE_SIZE },
            );
          }
        } else if (active.mode === "ai") {
          if (targetPage === 1) {
            response = await searchService.aiSearch(
              active.query,
              active.filters,
              {
                page: 1,
                limit: PAGE_SIZE,
              },
            );
          } else {
            // AI endpoint currently behaves as single-result-set. Use normal search for paging.
            response = await searchService.normalSearch(
              active.query,
              active.filters,
              {
                page: targetPage,
                limit: PAGE_SIZE,
              },
            );
          }
          setSemanticInfo(null);
        } else {
          response = await searchService.normalSearch(
            active.query,
            active.filters,
            {
              page: targetPage,
              limit: PAGE_SIZE,
            },
          );
          setSemanticInfo(null);
        }

        const incoming: PropertyPayload[] = Array.isArray(response.data)
          ? (response.data as PropertyPayload[])
          : [];
        setResults((prev) => {
          if (!append) return incoming;
          const seen = new Set(prev.map((item) => item.id));
          return [...prev, ...incoming.filter((item) => !seen.has(item.id))];
        });
        setTotal(Number(response.total) || incoming.length);
        setPage(targetPage);
        setHasSearched(true);

        const currentCount = append
          ? results.length + incoming.length
          : incoming.length;
        const totalCount = Number(response.total) || currentCount;
        setHasMore(incoming.length > 0 && currentCount < totalCount);

        const enrichedActive: ActiveSearch = {
          ...active,
          semanticSeed: nextSemanticSeed,
        };
        setActiveSearch(enrichedActive);
      } catch {
        toast.error("Search failed. Please try again.");
      } finally {
        loadingSetter(false);
      }
    },
    [results.length],
  );

  const runSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    const active: ActiveSearch = {
      mode,
      query: query.trim(),
      filters: { ...filters },
    };

    await executeSearch(active, 1, false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`, {
      replace: true,
    });
  };

  const loadMore = useCallback(() => {
    if (!activeSearch || !hasMore || isLoading || isLoadingMore) return;
    void executeSearch(activeSearch, page + 1, true, activeSearch.semanticSeed);
  }, [activeSearch, executeSearch, hasMore, isLoading, isLoadingMore, page]);

  const sentinelRef = useInfinteScroll({
    hasMore,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMore,
  });

  const examplePrompts = [
    "near hotel in delhi",
    "family friendly stay in goa for 4 guests",
    "budget rooms in jaipur under 3000",
    "luxury villa near beach in mumbai",
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Smart Property Search</h1>
        <p className="page-subtitle">
          Semantic search for natural language + AI + keyword search in one
          clean flow
        </p>
      </div>

      <div className="card card-body" style={{ marginBottom: "var(--space-6)" }}>
        <form
          onSubmit={runSearch}
          style={{ display: "grid", gap: "var(--space-4)" }}
        >
          <div
            style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}
          >
            <div className="search-bar" style={{ flex: 1, minWidth: "260px" }}>
              <Search size={18} className="search-bar-icon" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === "semantic"
                    ? "Try: near hotel in delhi"
                    : mode === "ai"
                      ? "Try: family friendly villa near beach"
                      : "Search by city, title, location"
                }
              />
            </div>

            <button
              type="button"
              className={`btn ${mode === "semantic" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setMode("semantic")}
            >
              <WandSparkles size={16} />
              Semantic
            </button>

            <button
              type="button"
              className={`btn ${mode === "normal" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setMode("normal")}
            >
              <Search size={16} />
              Normal
            </button>
            <button
              type="button"
              className={`btn ${mode === "ai" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setMode("ai")}
            >
              <Brain size={16} />
              AI Search
            </button>
            <Button
              className="w-full sm:w-auto"
              type="submit"
              isLoading={isLoading}
            >
              Search
            </Button>
          </div>

          <div
            style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}
          >
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: "var(--text-xs)", padding: "6px 10px" }}
                onClick={() => {
                  setQuery(prompt);
                  setMode("semantic");
                }}
              >
                <Sparkles size={12} />
                {prompt}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gap: "var(--space-3)",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            }}
          >
            <label>
              <small>City</small>
              <input
                className="form-input"
                value={filters.city || ""}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, city: e.target.value }))
                }
                placeholder="City"
              />
            </label>
            <label>
              <small>Min Price</small>
              <input
                className="form-input"
                type="number"
                value={filters.minPrice ?? ""}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    minPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </label>
            <label>
              <small>Max Price</small>
              <input
                className="form-input"
                type="number"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    maxPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </label>
            <label>
              <small>Guests</small>
              <input
                className="form-input"
                type="number"
                value={filters.capacity ?? ""}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    capacity: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </label>
            <label>
              <small>Bedrooms</small>
              <input
                className="form-input"
                type="number"
                value={filters.bedrooms ?? ""}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    bedrooms: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </label>
            <label>
              <small>Bathrooms</small>
              <input
                className="form-input"
                type="number"
                value={filters.bathrooms ?? ""}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    bathrooms: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </label>
            <label>
              <small>Sort By</small>
              <select
                className="form-input"
                style={{ height: "40px" }}
                value={filters.sortBy || "newest"}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, sortBy: e.target.value }))
                }
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ color: "var(--gray-300)", margin: 0 }}>
              <Filter
                size={14}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />
              {mode === "semantic"
                ? "Semantic mode: auto-detects city, intent, and constraints"
                : mode === "ai"
                  ? "AI mode active"
                  : "Keyword mode active"}
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setFilters({
                  city: "",
                  minPrice: undefined,
                  maxPrice: undefined,
                  capacity: undefined,
                  bedrooms: undefined,
                  bathrooms: undefined,
                });
                setSemanticInfo(null);
              }}
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {semanticInfo && (
        <div
          className="card"
          style={{
            marginBottom: "var(--space-4)",
            border: "1px solid var(--primary-200)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "var(--space-2)",
              fontSize: "var(--text-base)",
            }}
          >
            <Brain
              size={16}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            Semantic Interpretation
          </h3>
          <p
            style={{
              margin: 0,
              color: "var(--gray-300)",
              fontSize: "var(--text-sm)",
            }}
          >
            Intent: <strong>{semanticInfo.intent}</strong> | Rewritten query:{" "}
            <strong>{semanticInfo.rewrittenQuery}</strong>
          </p>
          {semanticInfo.keywords.length > 0 && (
            <p
              style={{
                marginTop: "var(--space-2)",
                marginBottom: 0,
                fontSize: "var(--text-sm)",
              }}
            >
              Keywords: {semanticInfo.keywords.join(", ")}
            </p>
          )}
        </div>
      )}

      <div style={{ marginBottom: "var(--space-4)" }}>
        <h2 style={{ margin: 0 }}>Results ({total})</h2>
      </div>

      {!hasSearched && !isLoading ? null : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={32} />
          </div>
          <h3 className="empty-state-title">No results found</h3>
          <p className="empty-state-description">
            Try different keywords or relax filters.
          </p>
        </div>
      ) : (
        <div className="layout">
          <div>
            <div className="list">
              {results.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => navigate(`/properties/${property.id}`)}
                />
              ))}
            </div>

            <div ref={sentinelRef} style={{ height: 1 }} />

            {(isLoadingMore || hasMore) && (
              <div
                style={{
                  marginTop: "var(--space-5)",
                  textAlign: "center",
                  color: "var(--gray-400)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {isLoadingMore
                  ? "Loading more results..."
                  : "Scroll to load more"}
              </div>
            )}
          </div>

          <div className="sidebar">
            <div
              style={{
                padding: "var(--space-4)",
                borderBottom: "1px solid rgba(213, 137, 27, 0.2)",
                background: "rgba(17, 13, 10, 0.6)",
                backdropFilter: "blur(16px)",
                borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
              }}
            >
              <h3
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: "var(--font-semibold)",
                  color: "var(--gray-50)",
                  margin: 0,
                }}
              >
                Properties near you
              </h3>
            </div>
            <div style={{ background: "rgba(17, 13, 10, 0.6)", backdropFilter: "blur(16px)", borderRadius: "0 0 var(--radius-xl) var(--radius-xl)", overflow: "hidden" }}>
              <NearBy />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
