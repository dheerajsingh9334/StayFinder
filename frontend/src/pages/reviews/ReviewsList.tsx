import { useCallback, useEffect, useState } from "react";
import { Star, MessageSquare, User, Calendar } from "lucide-react";
import Loader from "../../components/ui/Loader";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import { useInfinteScroll } from "../../hooks/useInfinteScroll";

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  property?: {
    title: string;
  };
}

export default function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const fetchReviews = useCallback(
    async (targetPage: number, append: boolean) => {
      const loadingSetter = append ? setIsLoadingMore : setIsLoading;

      try {
        loadingSetter(true);
        const { data } = await api.get("/reviews/me");

        const nextReviews: Review[] = Array.isArray(data?.myReviews)
          ? data.myReviews
          : [];
        const nextTotalPage = 1;

        setTotalPage(nextTotalPage);
        setReviews((prev) => {
          if (!append) return nextReviews;
          const seen = new Set(prev.map((item) => item.id));
          return [...prev, ...nextReviews.filter((item) => !seen.has(item.id))];
        });
        setPage(targetPage);
      } catch (error: unknown) {
        const err = error as any;
        toast.error(err.response?.data?.message || "Failed to load reviews");
      } finally {
        loadingSetter(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchReviews(1, false);
  }, [fetchReviews]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || page >= totalPage) return;
    void fetchReviews(page + 1, true);
  }, [fetchReviews, isLoading, isLoadingMore, page, totalPage]);

  const sentinelRef = useInfinteScroll({
    hasMore: page < totalPage,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMore,
  });

  if (isLoading && page === 1) {
    return <Loader size="lg" text="Loading reviews..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Reviews</h1>
        <p className="page-subtitle">See what guests and hosts are saying</p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={32} />
            <h3 className="empty-state-title">No reviews yet</h3>
            <p className="empty-state-description">Reviews will appear here</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-3)",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "var(--primary-100)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <User size={20} color="var(--primary-600)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: "600", marginBottom: "2px" }}>
                      {review.user?.name || "User"}
                    </p>
                    <p
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--gray-500)",
                      }}
                    >
                      {review.property?.title &&
                        `Reviewed: ${review.property.title}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={
                        i < review.rating
                          ? "var(--accent-amber)"
                          : "var(--gray-200)"
                      }
                      color={
                        i < review.rating
                          ? "var(--accent-amber)"
                          : "var(--gray-200)"
                      }
                    />
                  ))}
                </div>
              </div>

              <p
                style={{
                  marginBottom: "var(--space-3)",
                  lineHeight: "var(--leading-relaxed)",
                }}
              >
                {review.comment}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  fontSize: "var(--text-sm)",
                  color: "var(--gray-500)",
                }}
              >
                <Calendar size={14} />
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {reviews.length > 0 && totalPage > 1 && (
        <>
          <div ref={sentinelRef} style={{ height: 1 }} />
          {(isLoadingMore || page < totalPage) && (
            <div
              style={{
                marginTop: "var(--space-5)",
                textAlign: "center",
                color: "var(--gray-500)",
                fontSize: "var(--text-sm)",
              }}
            >
              {isLoadingMore
                ? "Loading more reviews..."
                : "Scroll to load more"}
            </div>
          )}
        </>
      )}
    </div>
  );
}
