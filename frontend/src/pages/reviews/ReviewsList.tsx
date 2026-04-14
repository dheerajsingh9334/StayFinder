import { Star, MessageSquare, User, Calendar, Trash2 } from "lucide-react";
import Loader from "../../components/ui/Loader";
import { api } from "../../services/api";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
    id?: string;
    title: string;
  };
}

export default function ReviewsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      const { data } = await api.get("/reviews/my");
      return data;
    }
  });

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const reviews: Review[] = data?.myReviews || [];

  if (isLoading) {
    return <Loader size="lg" text="Loading reviews..." />;
  }

  return (
    <div className="relative min-h-screen bg-black text-white p-6 md:p-12 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
              <MessageSquare size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">My Reviews</h1>
              <p className="text-white/50">See what you've shared about your stays</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 mt-12 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
              <div className="p-6 bg-white/5 rounded-full mb-6 text-white/20">
                <MessageSquare size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-2">No reviews yet</h3>
              <p className="text-white/50 text-center max-w-md">
                Share your experiences! After completing a stay, you can leave a review to help others find the perfect place.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="relative flex flex-col p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:border-white/30 transition-all hover:-translate-y-1">
                  
                  {/* Rating Badge */}
                  <div className="absolute top-6 right-6 flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <Star size={14} className="text-yellow-400" fill="currentColor" />
                    <span className="font-bold text-sm tracking-wide">{review.rating.toFixed(1)}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-5 max-w-[80%]">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-indigo-500/20 flex items-center justify-center shadow-lg">
                      {review.user?.avatarUrl ? (
                         <img src={review.user.avatarUrl} alt={review.user.name} className="w-full h-full object-cover" />
                      ) : (
                         <User size={24} className="text-indigo-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-semibold text-white tracking-tight">
                        {review.user?.name || "You"}
                      </p>
                      <button 
                         className="text-white/50 text-sm hover:text-indigo-400 transition-colors text-left"
                         onClick={() => review.property?.id && navigate(`/properties/${review.property.id}`)}
                      >
                        {review.property?.title && `Reviewed: ${review.property.title}`}
                      </button>
                    </div>
                  </div>

                  <p className="text-white/80 leading-relaxed mb-6 font-light flex-1">
                    "{review.comment}"
                  </p>

                  <div className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-widest mt-auto border-t border-white/10 pt-4">
                    <Calendar size={14} />
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="ml-auto text-rose-500/70 hover:text-rose-400 transition-colors flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 hover:bg-rose-500/20"
                      title="Delete Review"
                    >
                      <Trash2 size={12} />
                      <span className="text-[10px]">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
