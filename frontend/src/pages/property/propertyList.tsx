import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "../../features/property/property.hooks";
import { useFavorites, useToggleFavorite } from "../../features/favorites/favorites.hooks";
import { Search } from "lucide-react";
import PropertyCard from "../../components/property/PropertyCard";
import Loader from "../../components/ui/Loader";
import NearBy from "./NearBy";
import { useInfinteScroll } from "../../hooks/useInfinteScroll";
import type { PropertyPayload } from "../../features/property/property.types";
import { SearchPanel, defaultFilters } from "../../components/search/SearchPanel";
import type { SearchMode, ActiveSearch } from "../../components/search/SearchPanel";
import { searchService, type SearchFilters, type SemanticParseResult } from "../../services/search.service";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 12;

export default function PropertyList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<PropertyPayload[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { data: favoriteList } = useFavorites();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { data, isLoading, isError, isFetching } = useProperties(page);

  // ── Search State ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('semantic');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultFilters);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<PropertyPayload[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [semanticInfo, setSemanticInfo] = useState<SemanticParseResult | null>(null);
  const [activeSearch, setActiveSearch] = useState<ActiveSearch | null>(null);

  const searchResultsLenRef = useRef(0);
  useEffect(() => {
    searchResultsLenRef.current = searchResults.length;
  }, [searchResults]);

  const executeSearch = useCallback(
    async (
      active: ActiveSearch,
      targetPage: number,
      append: boolean,
      semanticSeed?: ActiveSearch['semanticSeed'],
    ) => {
      const loadingSetter = append ? setIsLoadingMore : setIsSearching;
      loadingSetter(true);

      try {
        let response;
        let nextSemanticSeed = semanticSeed;

        if (active.mode === 'semantic') {
          response = await searchService.semanticSearch(active.query, active.filters, {
            page: targetPage,
            limit: PAGE_SIZE,
          });
          if (response.semantic) {
            setSemanticInfo(response.semantic as SemanticParseResult);
            nextSemanticSeed = {
              rewrittenQuery: (response.semantic as SemanticParseResult).rewrittenQuery,
              mergedFilters: {
                ...(response.semantic as SemanticParseResult).extractedFilters,
                ...active.filters,
              },
            };
          }
        } else if (active.mode === 'ai') {
          response = await searchService.aiSearch(active.query, active.filters, {
            page: targetPage,
            limit: PAGE_SIZE,
          });
          setSemanticInfo(null);
        } else {
          response = await searchService.normalSearch(active.query, active.filters, {
            page: targetPage,
            limit: PAGE_SIZE,
          });
          setSemanticInfo(null);
        }

        const incoming: PropertyPayload[] = Array.isArray(response.data)
          ? (response.data as PropertyPayload[])
          : [];

        setSearchResults((prev) => {
          if (!append) return incoming;
          const seen = new Set(prev.map((item) => item.id));
          return [...prev, ...incoming.filter((item) => !seen.has(item.id))];
        });

        setSearchTotal(Number(response.total) || incoming.length);
        setSearchPage(targetPage);
        setHasSearched(true);

        const currentCount = append
          ? searchResultsLenRef.current + incoming.length
          : incoming.length;
        const totalCount = Number(response.total) || currentCount;
        setSearchHasMore(incoming.length > 0 && currentCount < totalCount);

        const enrichedActive: ActiveSearch = { ...active, semanticSeed: nextSemanticSeed };
        setActiveSearch(enrichedActive);
      } catch (err) {
        toast.error('Search failed. Please try again.');
        console.error(err);
      } finally {
        loadingSetter(false);
      }
    },
    [],
  );

  const runSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    const active: ActiveSearch = {
      mode: searchMode,
      query: searchQuery.trim(),
      filters: { ...searchFilters },
    };
    await executeSearch(active, 1, false);
  };

  const clearSearch = () => {
    setHasSearched(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchTotal(0);
    setSearchPage(1);
    setSearchHasMore(false);
    setSemanticInfo(null);
    setActiveSearch(null);
    setSearchFilters(defaultFilters);
    setPage(1);
  };

  const loadMoreSearch = useCallback(() => {
    if (!activeSearch || !searchHasMore || isSearching || isLoadingMore) return;
    void executeSearch(activeSearch, searchPage + 1, true, activeSearch.semanticSeed);
  }, [activeSearch, executeSearch, searchHasMore, isSearching, isLoadingMore, searchPage]);

  const searchSentinelRef = useInfinteScroll({
    hasMore: searchHasMore,
    isLoading: isSearching || isLoadingMore,
    onLoadMore: loadMoreSearch,
  });

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

  const effectiveSentinelRef = hasSearched ? searchSentinelRef : sentinelRef;
  const effectiveIsFetching = hasSearched ? (isSearching || isLoadingMore) : isFetching;
  const effectiveHasMore = hasSearched ? searchHasMore : page < totalPage;

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

  const items = hasSearched ? searchResults : allItems;
  const displayTotal = hasSearched ? searchTotal : total;

  return (
    <>
      {/* Search Panel */}
      <div className="landing-discovery-wrap" style={{ borderBottom: '1px solid var(--gray-100)', marginBottom: 'var(--space-6)' }}>
        <div className="landing-container">
          <SearchPanel
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            searchFilters={searchFilters}
            setSearchFilters={setSearchFilters}
            runSearch={runSearch}
            clearSearch={clearSearch}
            isSearching={isSearching}
            hasSearched={hasSearched}
            searchTotal={searchTotal}
            isLoadingMore={isLoadingMore}
            semanticInfo={semanticInfo}
            activeSearch={activeSearch}
            className="px-0 py-6"
            title="Discover Amazing Stays"
            subtitle={`${displayTotal} properties available`}
          />
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

              <div ref={effectiveSentinelRef} style={{ height: 1 }} />
              {(effectiveIsFetching || effectiveHasMore) && (
                <div
                  style={{
                    marginTop: "var(--space-5)",
                    textAlign: "center",
                    color: "var(--gray-500)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {effectiveIsFetching
                    ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                        <Loader size="sm" />
                        <span>Loading more properties...</span>
                      </div>
                    )
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
