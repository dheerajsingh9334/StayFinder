import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { api } from "../../services/api";
import Loader from "../ui/Loader";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
}

export default function PropertyReviews({ propertyId }: { propertyId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [breakdown, setBreakdown] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [page] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [propertyId, sortBy, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/reviews/property/${propertyId}?sortBy=${sortBy}&page=${page}&limit=50`);
      setReviews(data.reviews || []);
      setBreakdown(data.ratingBreakdown || {});
      setTotal(data.total || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="md" text="Loading reviews..." />;
  if (total === 0) return <div className="empty-state"><MessageSquare /><h3>No reviews yet</h3><p>Be the first to review this property.</p></div>;

  return (
    <div className="property-section" style={{ marginTop: "var(--space-6)" }}>
      <h3 className="property-section-title">Reviews ({total})</h3>
      
      {/* Breakdown */}
      <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap", marginBottom: "var(--space-6)" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const percent = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                <span style={{ minWidth: "20px", fontSize: "var(--text-sm)" }}>{star}★</span>
                <div style={{ flex: 1, height: "8px", background: "var(--gray-200)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${percent}%`, background: "var(--accent-amber)" }} />
                </div>
                <span style={{ minWidth: "30px", fontSize: "var(--text-xs)", color: "var(--gray-500)", textAlign: "right" }}>{percent.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
        
        {/* Sort */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}>
          <label style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", fontWeight: "500" }}>Sort by:</label>
          <select className="form-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "8px 12px", background: "var(--gray-50)" }}>
            <option value="newest">Newest first</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </div>
      </div>
      
      {/* Reviews List */}
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        {reviews.map(review => (
          <div key={review.id} style={{ padding: "var(--space-4)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", marginBottom: "var(--space-2)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {review.user?.avatarUrl ? <img src={review.user.avatarUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} /> : review.user?.name.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: "600", margin: 0 }}>{review.user?.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <div style={{ display: "flex" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? "var(--accent-amber)" : "var(--gray-200)"} color={i < review.rating ? "var(--accent-amber)" : "var(--gray-200)"} />
                    ))}
                  </div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-400)" }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--gray-700)" }}>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
