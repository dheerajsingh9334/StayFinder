import { api } from "./api";
import type { PropertyPayload } from "../features/property/property.types";

export type SearchFilters = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
};

export type SearchResult = {
  data: PropertyPayload[];
  total: number;
};

export type SearchOptions = {
  page?: number;
  limit?: number;
};

export type SemanticParseResult = {
  rewrittenQuery: string;
  extractedFilters: SearchFilters;
  intent: "nearby" | "budget" | "luxury" | "family" | "general";
  keywords: string[];
};

function normalizeSearchResponse(payload: any): SearchResult {
  if (!payload) return { data: [], total: 0 };

  // Backend usually returns:
  // { msg, count, data: { page, total, count, data: Property[] } }
  const envelope = payload?.data;
  const nestedList = envelope?.data;

  const list =
    (Array.isArray(nestedList) && nestedList) ||
    (Array.isArray(envelope) && envelope) ||
    (Array.isArray(payload?.properties) && payload.properties) ||
    (Array.isArray(payload?.results) && payload.results) ||
    (Array.isArray(payload?.data) && payload.data) ||
    [];

  const total =
    Number(envelope?.total) ||
    Number(payload?.total) ||
    Number(envelope?.count) ||
    Number(payload?.count) ||
    list.length;

  return {
    data: list,
    total,
  };
}

const cityWords = [
  "delhi",
  "mumbai",
  "bangalore",
  "bengaluru",
  "hyderabad",
  "pune",
  "kolkata",
  "chennai",
  "goa",
  "jaipur",
  "lucknow",
  "surat",
  "ahmedabad",
  "noida",
  "gurgaon",
  "gurugram",
];

const stopWords = new Set([
  "find",
  "show",
  "me",
  "a",
  "an",
  "the",
  "in",
  "at",
  "for",
  "with",
  "near",
  "around",
  "to",
  "from",
  "stays",
  "stay",
  "property",
  "properties",
]);

function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function parseSemanticQuery(query: string): SemanticParseResult {
  const q = normalizeSpaces(query.toLowerCase());
  const extractedFilters: SearchFilters = {};

  const cityMatch = q.match(/(?:in|near|around)\s+([a-z\s]+)/i);
  let detectedCity = "";

  if (cityMatch?.[1]) {
    const candidate = normalizeSpaces(cityMatch[1]);
    const cityFound = cityWords.find((c) => candidate.includes(c));
    detectedCity = cityFound || candidate.split(" ")[0] || "";
  } else {
    const cityFound = cityWords.find((c) => q.includes(c));
    detectedCity = cityFound || "";
  }

  if (detectedCity) {
    extractedFilters.city = detectedCity;
  }

  // guest count patterns: "for 4 people", "2 guests"
  const guestMatch = q.match(/(\d+)\s*(guest|guests|people|person|persons)/i);
  if (guestMatch) extractedFilters.capacity = Number(guestMatch[1]);

  const bedMatch = q.match(/(\d+)\s*(bed|beds|bedroom|bedrooms)/i);
  if (bedMatch) extractedFilters.bedrooms = Number(bedMatch[1]);

  const bathMatch = q.match(/(\d+)\s*(bath|baths|bathroom|bathrooms)/i);
  if (bathMatch) extractedFilters.bathrooms = Number(bathMatch[1]);

  const underMatch = q.match(/(?:under|below|less than)\s*(\d+)/i);
  if (underMatch) extractedFilters.maxPrice = Number(underMatch[1]);

  const aboveMatch = q.match(/(?:above|over|more than)\s*(\d+)/i);
  if (aboveMatch) extractedFilters.minPrice = Number(aboveMatch[1]);

  let intent: SemanticParseResult["intent"] = "general";
  if (q.includes("near") || q.includes("around")) intent = "nearby";
  if (q.includes("budget") || q.includes("cheap") || q.includes("affordable"))
    intent = "budget";
  if (q.includes("luxury") || q.includes("premium") || q.includes("5 star"))
    intent = "luxury";
  if (q.includes("family") || q.includes("kids") || q.includes("child"))
    intent = "family";

  const keywords = q
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w && !stopWords.has(w) && !cityWords.includes(w))
    .slice(0, 6);

  const rewrittenQuery = normalizeSpaces(
    [
      keywords.join(" "),
      detectedCity ? `in ${detectedCity}` : "",
      intent === "budget" ? "affordable" : "",
      intent === "luxury" ? "luxury" : "",
      intent === "family" ? "family-friendly" : "",
    ]
      .filter(Boolean)
      .join(" "),
  );

  return {
    rewrittenQuery: rewrittenQuery || q,
    extractedFilters,
    intent,
    keywords,
  };
}

export const searchService = {
  normalSearch: async (
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {},
  ) => {
    const params = new URLSearchParams();
    // Backend expects `search` key, not `query`.
    if (query.trim()) params.set("search", query.trim());

    if (filters.city) params.set("city", filters.city);
    if (filters.minPrice !== undefined) {
      params.set("minPrice", String(filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      params.set("maxPrice", String(filters.maxPrice));
    }
    if (filters.capacity !== undefined) {
      params.set("capacity", String(filters.capacity));
    }
    if (options.page !== undefined) {
      params.set("page", String(options.page));
    }
    if (options.limit !== undefined) {
      params.set("limit", String(options.limit));
    }

    // Backend currently does not support bedrooms/bathrooms in query schema.
    // Keep them in free-text so user intent still affects results.
    if (filters.bedrooms !== undefined) {
      const prev = params.get("search") || "";
      params.set("search", `${prev} ${filters.bedrooms} bedroom`.trim());
    }
    if (filters.bathrooms !== undefined) {
      const prev = params.get("search") || "";
      params.set("search", `${prev} ${filters.bathrooms} bathroom`.trim());
    }

    const res = await api.get(`/search?${params.toString()}`);
    return normalizeSearchResponse(res.data);
  },

  aiSearch: async (
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {},
  ) => {
    const mergedText = [
      query,
      filters.city ? `city ${filters.city}` : "",
      filters.minPrice !== undefined ? `min price ${filters.minPrice}` : "",
      filters.maxPrice !== undefined ? `max price ${filters.maxPrice}` : "",
      filters.capacity !== undefined ? `${filters.capacity} guests` : "",
      filters.bedrooms !== undefined ? `${filters.bedrooms} bedroom` : "",
      filters.bathrooms !== undefined ? `${filters.bathrooms} bathroom` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const res = await api.post("/search/aisearch", {
      // Backend AI controller expects `text` only.
      text: mergedText,
      page: options.page,
      limit: options.limit,
    });
    return normalizeSearchResponse(res.data);
  },

  semanticSearch: async (
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {},
  ) => {
    const parsed = parseSemanticQuery(query);
    const mergedFilters: SearchFilters = {
      ...parsed.extractedFilters,
      ...filters,
    };

    try {
      const ai = await searchService.aiSearch(
        parsed.rewrittenQuery,
        mergedFilters,
        options,
      );
      return {
        ...ai,
        semantic: parsed,
        mode: "ai" as const,
      };
    } catch {
      const normal = await searchService.normalSearch(
        parsed.rewrittenQuery,
        mergedFilters,
        options,
      );
      return {
        ...normal,
        semantic: parsed,
        mode: "normal" as const,
      };
    }
  },
};
