import { useNavigate } from "react-router-dom";
import { useOwnerProperties } from "../../features/property/property.hooks";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "../../components/ui/Loader";
import {
  Plus,
  Building2,
} from "lucide-react";
import type { PropertyPayload } from "../../features/property/property.types";
import { useInfinteScroll } from "../../hooks/useInfinteScroll";
import { InteractivePropertiesTable } from "../../components/ui/interactive-properties-table-shadcnui";

export default function OwnerProperty() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<PropertyPayload[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const { data, isLoading, isError, error, isFetching } =
    useOwnerProperties(page);

  useEffect(() => {
    if (!data) return;

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

  if (isLoading) {
    return (
      <div
        className="page-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="page-container"
        style={{ textAlign: "center", padding: "4rem 1rem" }}
      >
        <Building2
          size={64}
          style={{ color: "var(--danger)", margin: "0 auto 1rem" }}
        />
        <h2 style={{ marginBottom: "0.5rem" }}>Error Loading Properties</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
      </div>
    );
  }

  if (!data) return null;

  const items = allItems;

  if (!items.length) {
    return (
      <div
        className="page-container"
        style={{ textAlign: "center", padding: "4rem 1rem" }}
      >
        <Building2
          size={64}
          style={{ color: "var(--text-tertiary)", margin: "0 auto 1rem" }}
        />
        <h2 style={{ marginBottom: "0.5rem" }}>No Properties Listed</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Start hosting by creating your first property listing
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/CreateProperty")}
        >
          <Plus size={18} />
          Create Property
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <InteractivePropertiesTable 
         properties={items} 
         isLoading={isFetching} 
         onRefresh={loadMore} 
      />
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
}
