import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Star, Send } from "lucide-react";
import Button from "../../components/ui/Button";
import { api } from "../../services/api";
import toast from "react-hot-toast";

export default function CreateReview() {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment) {
      toast.error("Please provide rating and comment");
      return;
    }

    const bookingId = searchParams.get("bookingId") || propertyId;
    if (!bookingId) {
      toast.error("Booking id is required to submit review");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/reviews/add", {
        bookingId,
        rating,
        comment,
      });
      toast.success("Review submitted successfully!");
      navigate(-1);
    } catch (error: unknown) {
      const err = error as any;
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Share Your Experience</h1>
        <p className="page-subtitle">
          Help other travelers make informed decisions
        </p>
      </div>

      <div className="card" style={{ maxWidth: "600px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <label
              style={{
                display: "block",
                marginBottom: "var(--space-3)",
                fontWeight: "600",
              }}
            >
              Rating
            </label>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "var(--space-2)",
                  }}
                >
                  <Star
                    size={32}
                    fill={
                      i < rating ? "var(--accent-amber)" : "var(--gray-200)"
                    }
                    color={
                      i < rating ? "var(--accent-amber)" : "var(--gray-200)"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "var(--space-6)" }}>
            <label
              style={{
                display: "block",
                marginBottom: "var(--space-3)",
                fontWeight: "600",
              }}
            >
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "var(--space-3)",
                border: "1px solid var(--gray-200)",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-base)",
                minHeight: "150px",
                resize: "vertical",
              }}
            />
          </div>

          <Button
            isLoading={isLoading}
            type="submit"
            variant="primary"
            fullWidth
          >
            <Send size={18} />
            Submit Review
          </Button>
        </form>
      </div>
    </div>
  );
}
