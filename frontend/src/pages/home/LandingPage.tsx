import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  useProperties,
  useNearByProperty,
  useAllPropertiesForGlobe,
} from '../../features/property/property.hooks';

import { useLiveLocation } from '../../hooks/useLiveLocation';
import { useInfinteScroll } from '../../hooks/useInfinteScroll';
import MapView from '../map/MapView';
import { Hero } from '@/components/ui/hero';
import { GlobePulse } from '@/components/ui/cobe-globe-pulse';
import { ShiningText } from '../../components/ui/shining-text';
import { FeyButton, cn } from '../../components/ui/fey-button';
import type { RootState } from '@/store';
import type {
  NearByProperty,
  PropertyPayload,
} from '../../features/property/property.types';
import {
  searchService,
  type SearchFilters,
  type SemanticParseResult,
} from '../../services/search.service';
import { SearchPanel, defaultFilters } from '../../components/search/SearchPanel';
import type { SearchMode, ActiveSearch } from '../../components/search/SearchPanel';

const PAGE_SIZE = 20;

export default function LandingPage() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLiveLocation();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  // Track whether we've already consumed the URL ?q= param
  const urlQueryConsumed = useRef(false);

  // ── Browse-all pagination ──────────────────────────────────────────────────
  const [allPage, setAllPage] = useState(1);

  // ── Scope filter (globe / map) ─────────────────────────────────────────────
  const [filterScope, setFilterScope] = useState<'both' | 'all' | 'nearby'>(
    'both',
  );

  // ── Search state ───────────────────────────────────────────────────────────
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

  // Ref to track results.length in closure for executeSearch
  const searchResultsLenRef = useRef(0);
  useEffect(() => {
    searchResultsLenRef.current = searchResults.length;
  }, [searchResults]);

  // ── Static data fetches ────────────────────────────────────────────────────
  const { data: allPropertiesRes, isLoading: isAllLoading } = useProperties(
    allPage,
    20,
    '',
  );
  const { data: globePropertiesRes } = useAllPropertiesForGlobe();
  const { data: nearByRes, isLoading: isNearByLoading } = useNearByProperty(
    location?.lat,
    location?.lng,
  );

  const allPageTotal = allPropertiesRes?.totalPage ?? 1;
  const allPageCount = allPropertiesRes?.total ?? 0;

  const allProperties = useMemo(
    () => (allPropertiesRes?.data || []) as PropertyPayload[],
    [allPropertiesRes?.data],
  );
  const globeAllProperties = useMemo(
    () => (globePropertiesRes?.data || []) as PropertyPayload[],
    [globePropertiesRes?.data],
  );
  const nearbyProperties = useMemo(
    () => (nearByRes?.data || []) as NearByProperty[],
    [nearByRes?.data],
  );

  // ── Search execution ───────────────────────────────────────────────────────
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
        let response: any;
        let nextSemanticSeed = semanticSeed;

        if (active.mode === 'semantic') {
          if (targetPage === 1) {
            response = await searchService.semanticSearch(active.query, active.filters, {
              page: 1,
              limit: PAGE_SIZE,
            });
            setSemanticInfo(response.semantic);
            nextSemanticSeed = {
              rewrittenQuery: response.semantic.rewrittenQuery,
              mergedFilters: { ...response.semantic.extractedFilters, ...active.filters },
            };
          } else {
            response = await searchService.normalSearch(
              semanticSeed?.rewrittenQuery || active.query,
              semanticSeed?.mergedFilters || active.filters,
              { page: targetPage, limit: PAGE_SIZE },
            );
          }
        } else if (active.mode === 'ai') {
          if (targetPage === 1) {
            response = await searchService.aiSearch(active.query, active.filters, {
              page: 1,
              limit: PAGE_SIZE,
            });
          } else {
            response = await searchService.normalSearch(active.query, active.filters, {
              page: targetPage,
              limit: PAGE_SIZE,
            });
          }
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
      } catch {
        toast.error('Search failed. Please try again.');
      } finally {
        loadingSetter(false);
      }
    },
    [],
  );

  // ── Auto-search from URL ?q= param (navbar search lands here) ────────────
  useEffect(() => {
    if (urlQueryConsumed.current) return;
    const params = new URLSearchParams(routerLocation.search);
    const q = params.get('q');
    if (!q?.trim()) return;
    urlQueryConsumed.current = true;
    setSearchQuery(q.trim());
    // Clean up the URL so it stays tidy without the ?q= param
    navigate('/', { replace: true });
    // Fire the search
    const active: ActiveSearch = {
      mode: 'semantic',
      query: q.trim(),
      filters: defaultFilters,
    };
    void executeSearch(active, 1, false);
  }, []); // intentionally runs only on mount

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
    setAllPage(1);
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

  // ── List data: search wins over browse-all ─────────────────────────────────
  const filteredAll = useMemo(
    () => (hasSearched ? searchResults : allProperties),
    [hasSearched, searchResults, allProperties],
  );

  // ── Map / Globe: derive from search results or browse-all ─────────────────
  const toNearByShape = (p: PropertyPayload): NearByProperty => ({
    id: p.id,
    title: p.title,
    price: p.price,
    state: p.state,
    city: p.city,
    lat: p.lat ?? null,
    lng: p.lng ?? null,
    images: p.images ?? [],
    averageRating: p.averageRating ?? 0,
    availability: p.availability ?? [],
  });

  // When search is active use search results for "All" layer of the map
  const activeAllMapPool: NearByProperty[] = useMemo(() => {
    if (hasSearched) return searchResults.map(toNearByShape);
    return globeAllProperties.map(toNearByShape);
  }, [hasSearched, searchResults, globeAllProperties]);

  // Fallback nearby (when no GPS)
  const fallbackNearbyProperties = useMemo(
    () => allProperties.map(toNearByShape),
    [allProperties],
  );

  const effectiveNearbyProperties: NearByProperty[] = location
    ? nearbyProperties
    : fallbackNearbyProperties;

  const allMapProperties = useMemo(
    () =>
      activeAllMapPool.filter(
        (p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)),
      ),
    [activeAllMapPool],
  );

  const nearbyMapProperties = useMemo(
    () =>
      effectiveNearbyProperties.filter(
        (p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)),
      ),
    [effectiveNearbyProperties],
  );

  const mergedMapProperties = useMemo(() => {
    const byId = new Map<string, NearByProperty>();
    [...allMapProperties, ...nearbyMapProperties].forEach((p) => byId.set(p.id, p));
    return Array.from(byId.values());
  }, [allMapProperties, nearbyMapProperties]);

  const scopedMapProperties = useMemo(() => {
    if (filterScope === 'all') return allMapProperties;
    if (filterScope === 'nearby') return nearbyMapProperties;
    return mergedMapProperties;
  }, [filterScope, allMapProperties, nearbyMapProperties, mergedMapProperties]);

  const globeMarkers = useMemo(
    () =>
      [
        ...scopedMapProperties,
        ...(location
          ? [
              {
                id: 'user-location',
                location: [location.lat, location.lng] as [number, number],
                delay: 0,
                tone: 'user' as const,
              },
            ]
          : []),
      ]
        .filter(
          (p) =>
            !('location' in p) ||
            (Number.isFinite(Number(p.location[0])) &&
              Number.isFinite(Number(p.location[1]))),
        )
        .map((p, index) => {
          const isUserLoc = p.id === 'user-location';
          return {
            id: p.id,
            location: ('location' in p
              ? p.location
              : [Number(p.lat), Number(p.lng)]) as [number, number],
            delay: index * 0.35,
            tone: 'tone' in p ? p.tone : undefined,
            title: isUserLoc ? 'Your location' : ('title' in p ? p.title : undefined),
            image: !isUserLoc && 'images' in p ? (p.images as string[])?.[0] : undefined,
            price: !isUserLoc && 'price' in p ? (p as any).price : undefined,
            city: !isUserLoc && 'city' in p ? (p as any).city : undefined,
            href: !isUserLoc ? `/properties/${p.id}` : undefined,
            onClick: !isUserLoc
              ? () => {
                  setNavigatingId(p.id as string);
                  setTimeout(() => navigate(`/properties/${p.id}`), 400);
                }
              : undefined,
          };
        }),
    [scopedMapProperties, location, navigate],
  );

  const mapFocus = scopedMapProperties[0];

  // ── Nearby infinite scroll (browse-all mode) ───────────────────────────────
  const [visibleNearbyCount, setVisibleNearbyCount] = useState(10);
  const loadMoreNearby = useCallback(() => {
    setVisibleNearbyCount((prev) =>
      Math.min(prev + 10, effectiveNearbyProperties.length),
    );
  }, [effectiveNearbyProperties.length]);
  const nearbyHasMore = visibleNearbyCount < effectiveNearbyProperties.length;
  const nearbySentinelRef = useInfinteScroll({
    hasMore: filterScope !== 'all' && nearbyHasMore && !hasSearched,
    isLoading: isNearByLoading,
    onLoadMore: loadMoreNearby,
  });
  const visibleNearbyProperties = useMemo(
    () => effectiveNearbyProperties.slice(0, visibleNearbyCount),
    [effectiveNearbyProperties, visibleNearbyCount],
  );

  // ── Card renderer ──────────────────────────────────────────────────────────
  const renderFeaturedCard = (
    property: PropertyPayload | NearByProperty | undefined,
    badgeText: string,
  ) => {
    if (!property) return null;
    const coverImage = property.images?.[0];
    const locationText = [property.city, property.state].filter(Boolean).join(', ');
    return (
      <article key={property.id} className="landing-featured-card">
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
            {locationText || 'Location unavailable'}
          </p>
          <div className="landing-featured-meta">
            <span className="landing-featured-price">
              ₹{Number(property.price || 0).toLocaleString()} / night
            </span>
            <span className="landing-featured-rating">
              <Star size={14} />
              {Number(property.averageRating || 0) > 0
                ? Number(property.averageRating).toFixed(1)
                : 'New'}
            </span>
          </div>
          <FeyButton
            type="button"
            className="mt-4 w-full"
            onClick={() => {
              setNavigatingId(property.id);
              setTimeout(() => navigate(`/properties/${property.id}`), 400);
            }}
            isLoading={navigatingId === property.id}
          >
            View details
          </FeyButton>
        </div>
      </article>
    );
  };

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="landing-page relative min-h-[calc(100vh-60px)] w-full">
        {isAuthenticated ? (
          <Hero
            className="landing-hero-shell w-full"
            title={
              <>
                Welcome back,
                <br />
                <span className="">keep exploring stays</span>
              </>
            }
            subtitle="Browse the newest properties, refine your search, and jump straight into booking."
            titleClassName="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mt-20"
            subtitleClassName="text-base md:text-xl max-w-[760px]"
          />
        ) : (
          <Hero
            className="landing-hero-shell w-full"
            title={
              <>
                Find Your Perfect Stay,
                <br />
                <span className="">Anywhere in the World</span>
              </>
            }
            subtitle="Discover handpicked properties with transparent pricing and exceptional hosts. Start with a Google sign-in, then explore the best stays near you."
            titleClassName="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mt-20"
            subtitleClassName="text-base md:text-xl max-w-[760px]"
          >
            <div className="mt-8 flex justify-center w-full">
              <FeyButton
                className="min-w-50 h-12 text-sm px-6 shadow-xl"
                onClick={() =>
                  (window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/google`)
                }
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  style={{ width: 18, height: 18 }}
                  className="mr-2 inline-block"
                />
                Continue with Google
              </FeyButton>
            </div>
          </Hero>
        )}
      </div>

      {/* ── Search Panel ─────────────────────────────────────────────────── */}
      <section className="landing-discovery-wrap">
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
          />
        </div>
      </section>

      {/* ── Globe ────────────────────────────────────────────────────────── */}
      <section className="landing-discovery-wrap">
        <div className="landing-container">
          <section className="landing-discovery-section">
            <div className="landing-discovery-header">
              <h2 className="landing-discovery-title">
                {hasSearched ? 'Matching properties on the globe' : 'Where travelers are booking now'}
              </h2>
              <p className="landing-discovery-subtitle">
                {hasSearched
                  ? `${scopedMapProperties.length} properties match your search — each dot is a real listing.`
                  : 'Live property coordinates power the globe pulses below. Each dot maps to a real listing in the catalog.'}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="border border-white/10 bg-black p-4 shadow-[0_24px_70px_#000000]">
                <GlobePulse
                  markers={globeMarkers.length > 0 ? globeMarkers : undefined}
                  className="mx-auto max-w-130"
                />
              </div>

              <div className="space-y-4">
                <div className="landing-featured-card">
                  <span className="landing-featured-badge">
                    {hasSearched ? 'Search results' : 'Real listings'}
                  </span>
                  <h3 className="landing-featured-title">
                    {hasSearched
                      ? `${scopedMapProperties.length} properties found`
                      : 'Connected to your property feed'}
                  </h3>
                  <p className="landing-featured-location">
                    {hasSearched
                      ? 'The globe and map below reflect your current search. Clear the search to restore the full catalog view.'
                      : 'Use the same listing coordinates that drive the map view, so the globe stays in sync with the catalog.'}
                  </p>
                  <p className="mt-3 text-sm text-white/70">
                    Tap any pulse on the globe to open that property's details page and jump straight from discovery to booking.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {hasSearched ? 'Search synced' : 'Live feed sync'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Clickable markers
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Property detail links
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* ── Map + Lists ──────────────────────────────────────────────────── */}
      <section className="landing-discovery-wrap">
        <div className="landing-container">
          <section className="landing-discovery-section">
            <div className="landing-discovery-header">
              <h2 className="landing-discovery-title">
                {hasSearched ? 'Search Results' : 'Explore on the Map'}
              </h2>
              <p className="landing-discovery-subtitle">
                {hasSearched
                  ? 'Map and list both reflect your active search. Toggle scope to include nearby properties.'
                  : 'Filter and explore all listings plus nearby recommendations.'}
              </p>

              {/* Scope filter buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <FeyButton
                  className={cn(
                    'h-9 px-5 min-w-0 text-sm',
                    filterScope === 'all' ? 'opacity-100' : 'opacity-60 grayscale-[0.5]',
                  )}
                  onClick={() => setFilterScope('all')}
                >
                  Map All
                </FeyButton>
                <FeyButton
                  className={cn(
                    'h-9 px-5 min-w-0 text-sm',
                    filterScope === 'nearby' ? 'opacity-100' : 'opacity-60 grayscale-[0.5]',
                  )}
                  onClick={() => setFilterScope('nearby')}
                >
                  Nearby
                </FeyButton>
                <FeyButton
                  className={cn(
                    'h-9 px-5 min-w-0 text-sm border-indigo-500/30',
                    filterScope === 'both'
                      ? 'opacity-100 ring-1 ring-indigo-500/20'
                      : 'opacity-60 grayscale-[0.5]',
                  )}
                  onClick={() => setFilterScope('both')}
                >
                  Show Both
                </FeyButton>
              </div>
            </div>

            {/* Map view */}
            <div className="landing-map-shell">
              <div className="landing-list-header" style={{ marginBottom: 'var(--space-3)' }}>
                <h3>
                  Map View —{' '}
                  {filterScope === 'all'
                    ? hasSearched
                      ? 'Search Results'
                      : 'All Properties'
                    : filterScope === 'nearby'
                      ? 'Nearby Only'
                      : hasSearched
                        ? 'Search + Nearby'
                        : 'All + Nearby'}
                </h3>
                <span>{scopedMapProperties.length}</span>
              </div>
              <div className="landing-map-frame">
                {scopedMapProperties.length > 0 ? (
                  <MapView
                    properties={scopedMapProperties}
                    userLat={location?.lat}
                    userLng={location?.lng}
                    focusLat={mapFocus?.lat ?? undefined}
                    focusLng={mapFocus?.lng ?? undefined}
                  />
                ) : (
                  <div className="landing-map-fallback">
                    {hasSearched
                      ? 'No matching properties have map coordinates for this filter.'
                      : 'No mappable properties for this filter.'}
                  </div>
                )}
              </div>
            </div>

            {/* Property Lists */}
            <div className="landing-property-split">
              {/* All / Search results column */}
              {filterScope !== 'nearby' && (
                <div>
                  <div className="landing-list-header">
                    <h3>{hasSearched ? `Results for "${activeSearch?.query}"` : 'All Properties'}</h3>
                    <span>
                      {hasSearched
                        ? `${searchTotal} total`
                        : allPageCount > 0
                          ? `Page ${allPage} of ${allPageTotal} (${allPageCount} total)`
                          : `${filteredAll.length} shown`}
                    </span>
                  </div>

                  {isSearching ? (
                    <div className="flex w-full justify-center py-10">
                      <ShiningText text="Searching…" />
                    </div>
                  ) : !hasSearched && isAllLoading ? (
                    <div className="flex w-full justify-center py-10">
                      <ShiningText text="Loading properties…" />
                    </div>
                  ) : filteredAll.length === 0 ? (
                    <p className="landing-empty-copy">
                      {hasSearched
                        ? 'No results found. Try different keywords or clear filters.'
                        : 'No properties match this filter.'}
                    </p>
                  ) : (
                    <>
                      <div className="landing-property-grid landing-property-grid-single">
                        {filteredAll.map((property) =>
                          renderFeaturedCard(property, hasSearched ? 'Result' : 'All listing'),
                        )}
                      </div>

                      {/* Infinite scroll sentinel for search */}
                      {hasSearched && (
                        <div ref={searchSentinelRef} style={{ height: 1 }} />
                      )}
                      {hasSearched && (isLoadingMore || searchHasMore) && (
                        <div
                          style={{
                            marginTop: 'var(--space-5)',
                            textAlign: 'center',
                            color: 'var(--gray-400)',
                            fontSize: 'var(--text-sm)',
                          }}
                        >
                          {isLoadingMore ? 'Loading more results…' : 'Scroll to load more'}
                        </div>
                      )}

                      {/* Pagination for browse-all mode */}
                      {!hasSearched && allPageTotal > 1 && (
                        <div className="landing-pagination">
                          <button
                            className="landing-page-btn"
                            disabled={allPage === 1}
                            onClick={() => setAllPage((p) => Math.max(1, p - 1))}
                          >
                            <ChevronLeft size={16} /> Prev
                          </button>
                          <span className="landing-page-info">
                            {allPage} / {allPageTotal}
                          </span>
                          <button
                            className="landing-page-btn"
                            disabled={allPage === allPageTotal}
                            onClick={() => setAllPage((p) => Math.min(allPageTotal, p + 1))}
                          >
                            Next <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Nearby column — always shows GPS / fallback properties */}
              {filterScope !== 'all' && (
                <div>
                  <div className="landing-list-header">
                    <h3>Nearby</h3>
                    <span>
                      {hasSearched
                        ? effectiveNearbyProperties.length
                        : `${visibleNearbyProperties.length} / ${effectiveNearbyProperties.length}`}
                    </span>
                  </div>

                  {location && isNearByLoading ? (
                    <div className="flex w-full justify-center py-10">
                      <ShiningText text="Loading nearby stays…" />
                    </div>
                  ) : effectiveNearbyProperties.length === 0 ? (
                    <p className="landing-empty-copy">
                      No nearby or fallback properties found.
                    </p>
                  ) : (
                    <div
                      className="landing-property-grid landing-property-grid-single"
                      style={{ gap: 'var(--space-4)' }}
                    >
                      {!location && (
                        <p className="landing-empty-copy">
                          Showing filtered stays until live location is enabled.
                        </p>
                      )}
                      {(hasSearched ? effectiveNearbyProperties : visibleNearbyProperties).map(
                        (property) => renderFeaturedCard(property, 'Nearby pick'),
                      )}
                      {!hasSearched && (
                        <div ref={nearbySentinelRef} className="landing-scroll-sentinel" />
                      )}
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
