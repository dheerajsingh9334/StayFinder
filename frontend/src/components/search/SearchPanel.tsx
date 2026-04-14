'use client';

import React, { useState } from 'react';
import { Search, X, WandSparkles, Brain, Filter, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { FeyButton } from '../ui/fey-button';
import { ShiningText } from '../ui/shining-text';
import type { SearchFilters, SemanticParseResult } from '../../services/search.service';

export type SearchMode = 'semantic' | 'ai' | 'normal';

export interface ActiveSearch {
  mode: SearchMode;
  query: string;
  filters: SearchFilters;
  semanticSeed?: {
    rewrittenQuery: string;
    mergedFilters: SearchFilters;
  };
}

export const defaultFilters: SearchFilters = {
  sortBy: 'newest',
};

const examplePrompts = [
  'Luxury beach villa in Goa',
  'Family pool house for 6 people under 10000',
  'Modern apartment in Mumbai with Wifi',
  'Cheap stay in Jaipur for 2 guests',
];

interface SearchPanelProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchMode: SearchMode;
  setSearchMode: (m: SearchMode) => void;
  searchFilters: SearchFilters;
  setSearchFilters: (f: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => void;
  runSearch: (e?: React.FormEvent) => void;
  clearSearch: () => void;
  isSearching: boolean;
  hasSearched: boolean;
  searchTotal: number;
  isLoadingMore?: boolean;
  semanticInfo?: SemanticParseResult | null;
  activeSearch?: ActiveSearch | null;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function SearchPanel({
  searchQuery,
  setSearchQuery,
  searchMode,
  setSearchMode,
  searchFilters,
  setSearchFilters,
  runSearch,
  clearSearch,
  isSearching,
  hasSearched,
  searchTotal,
  isLoadingMore,
  semanticInfo,
  activeSearch,
  className = '',
  title = "Find Your Stay Faster",
  subtitle = "Search by keyword, city, price, guests, or let AI understand your intent."
}: SearchPanelProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <section className={`landing-discovery-section ${className}`} style={{ paddingBottom: 0 }}>
      {title && (
        <div className="landing-discovery-header">
          <h2 className="landing-discovery-title">{title}</h2>
          <p className="landing-discovery-subtitle">{subtitle}</p>
        </div>
      )}

      <form onSubmit={runSearch} style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {/* Query row */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '220px' }}>
            <Search size={16} className="search-bar-icon" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchMode === 'semantic'
                  ? 'Try: luxury beach villa in goa'
                  : searchMode === 'ai'
                    ? 'Try: family friendly stay for 4 guests'
                    : 'Search by city, title, location'
              }
            />
            {searchQuery && (
              <button
                type="button"
                className="gn-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Mode toggles */}
          <button
            type="button"
            className={`btn ${searchMode === 'semantic' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSearchMode('semantic')}
          >
            <WandSparkles size={14} />
            <span className="hidden sm:inline">Semantic</span>
          </button>
          <button
            type="button"
            className={`btn ${searchMode === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSearchMode('ai')}
          >
            <Brain size={14} />
            <span className="hidden sm:inline">AI</span>
          </button>
          <button
            type="button"
            className={`btn ${searchMode === 'normal' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSearchMode('normal')}
          >
            <Search size={14} />
            <span className="hidden sm:inline">Normal</span>
          </button>

          {/* Filters toggle */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filters</span>
            {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <FeyButton
            type="submit"
            className="h-10 px-6 min-w-0 text-sm"
            isLoading={isSearching}
          >
            Search
          </FeyButton>

          {hasSearched && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={clearSearch}
            >
              <X size={13} />
              Clear
            </button>
          )}
        </div>

        {/* Example prompts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: 'var(--text-xs)', padding: '5px 10px' }}
              onClick={() => {
                setSearchQuery(prompt);
                setSearchMode('semantic');
              }}
            >
              <Sparkles size={11} />
              {prompt}
            </button>
          ))}
        </div>

        {/* Expandable filter grid */}
        {showFilters && (
          <div
            style={{
              display: 'grid',
              gap: 'var(--space-3)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            }}
          >
            <label>
              <small>City</small>
              <input
                className="form-input"
                value={searchFilters.city || ''}
                onChange={(e) =>
                  setSearchFilters((p) => ({ ...p, city: e.target.value }))
                }
                placeholder="City"
              />
            </label>
            <label>
              <small>Min Price (₹)</small>
              <input
                className="form-input"
                type="number"
                value={searchFilters.minPrice ?? ''}
                onChange={(e) =>
                  setSearchFilters((p) => ({
                    ...p,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </label>
            <label>
              <small>Max Price (₹)</small>
              <input
                className="form-input"
                type="number"
                value={searchFilters.maxPrice ?? ''}
                onChange={(e) =>
                  setSearchFilters((p) => ({
                    ...p,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </label>
            <label>
              <small>Guests</small>
              <input
                className="form-input"
                type="number"
                value={searchFilters.capacity ?? ''}
                onChange={(e) =>
                  setSearchFilters((p) => ({
                    ...p,
                    capacity: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </label>
            <label>
              <small>Bedrooms</small>
              <input
                className="form-input"
                type="number"
                value={searchFilters.bedrooms ?? ''}
                onChange={(e) =>
                  setSearchFilters((p) => ({
                    ...p,
                    bedrooms: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </label>
            <label>
              <small>Bathrooms</small>
              <input
                className="form-input"
                type="number"
                value={searchFilters.bathrooms ?? ''}
                onChange={(e) =>
                  setSearchFilters((p) => ({
                    ...p,
                    bathrooms: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </label>
            <label>
              <small>Sort By</small>
              <select
                className="form-input"
                style={{ height: '40px' }}
                value={searchFilters.sortBy || 'newest'}
                onChange={(e) =>
                  setSearchFilters((p) => ({ ...p, sortBy: e.target.value }))
                }
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </label>
          </div>
        )}

        {/* Mode hint + clear filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--gray-400)', margin: 0, fontSize: 'var(--text-sm)' }}>
            <Filter size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            {searchMode === 'semantic'
              ? 'Semantic: auto-extracts city, intent & constraints from natural language'
              : searchMode === 'ai'
                ? 'AI mode: uses intelligent matching'
                : 'Keyword mode: exact text search'}
          </p>
          {showFilters && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: 'var(--text-xs)' }}
              onClick={() => setSearchFilters(defaultFilters)}
            >
              Reset Filters
            </button>
          )}
        </div>
      </form>

      {/* Semantic interpretation badge */}
      {semanticInfo && (
        <div
          className="card"
          style={{
            marginTop: 'var(--space-4)',
            border: '1px solid var(--primary-200)',
            padding: 'var(--space-3)',
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <Brain size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            Semantic Interpretation
          </h3>
          <p style={{ margin: 0, color: 'var(--gray-300)', fontSize: 'var(--text-xs)' }}>
            Intent: <strong>{semanticInfo.intent}</strong> · Rewritten:{' '}
            <strong>{semanticInfo.rewrittenQuery}</strong>
            {semanticInfo.keywords.length > 0 && (
              <> · Keywords: {semanticInfo.keywords.join(', ')}</>
            )}
          </p>
        </div>
      )}

      {/* Search summary badge */}
      {hasSearched && (
        <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ color: 'var(--gray-300)', fontSize: 'var(--text-sm)' }}>
            {searchTotal} result{searchTotal !== 1 ? 's' : ''} for{' '}
            <strong>"{activeSearch?.query}"</strong>
          </span>
          {isLoadingMore && (
            <ShiningText text="Loading more…" />
          )}
        </div>
      )}
    </section>
  );
}
