import { useState, useEffect } from "react";
import { Heart, MapPin, Star } from "lucide-react";
import Loader from "../../components/ui/Loader";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface FavoriteProperty {
  id: string;
  name: string;
  images?: string[];
  price: number;
  rating?: number;
  reviews?: number;
  location: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  title?: string;
}

interface FavoriteItem {
  id: string;
  property: {
    id: string;
    city?: string;
    country?: string;
    price: number;
    images?: string[];
    averageRating?: number;
    title?: string;
  };
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/favorite/my");
      const items: FavoriteItem[] = Array.isArray(data?.myFavorites)
        ? data.myFavorites
        : [];
      const normalized: FavoriteProperty[] = items
        .filter((item) => item?.property?.id)
        .map((item) => ({
          id: item.property.id,
          name: item.property.title || item.property.city || "Favorite Property",
          images: item.property.images || [],
          price: Number(item.property.price || 0),
          rating: Number(item.property.averageRating || 0),
          location: item.property.city || "Unknown",
          city: item.property.city,
          state: item.property.country,
          title: item.property.title,
        }));
      setFavorites(normalized);
    } catch (error: unknown) {
      const err = error as any;
      toast.error(err.response?.data?.message || "Failed to load favorites");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/favorite/remove/${propertyId}`);
      toast.success("Removed from favorites");
      setFavorites((prev) => prev.filter((fav) => fav.id !== propertyId));
    } catch (error: unknown) {
      const err = error as any;
      toast.error(err.response?.data?.message || "Failed to remove");
    }
  };

  if (isLoading) {
    return <Loader size="lg" text="Loading your favorites..." />;
  }

  return (
    <div className="relative min-h-screen bg-black text-white p-6 md:p-12 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-900/20 via-black to-black pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400">
              <Heart size={28} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">My Wishlist</h1>
              <p className="text-white/50">{favorites.length} properties saved</p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 mt-12 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
            <div className="p-6 bg-white/5 rounded-full mb-6">
              <Heart size={48} className="text-rose-500/30" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No favorites yet</h3>
            <p className="text-white/50 text-center max-w-md mb-8">
              Start saving properties you love by clicking the heart icon on any listing to keep them handy for later.
            </p>
            <button
              onClick={() => navigate("/properties")}
              className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
            >
              Explore Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((property) => (
              <div
                key={property.id}
                onClick={() => navigate(`/properties/${property.id}`)}
                className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md hover:border-white/30 transition-all cursor-pointer"
              >
                <div
                  className="aspect-[4/3] w-full bg-gray-900 relative transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: property.images?.[0] ? `url(${property.images[0]})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                
                {/* Overlay gradient */}
                <div className="absolute top-0 left-0 w-full aspect-[4/3] bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                <button
                  onClick={(e) => handleRemove(e, property.id)}
                  className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-full hover:bg-black/60 hover:scale-110 transition-all active:scale-95"
                  aria-label="Remove from favorites"
                >
                  <Heart size={18} className="text-rose-500" fill="currentColor" />
                </button>

                <div className="p-5 flex flex-col flex-1 bg-black/40 backdrop-blur-xl relative z-10">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-semibold text-lg leading-tight truncate">{property.name}</h3>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star size={14} className="text-yellow-400" fill="currentColor" />
                      <span>{property.rating ? property.rating.toFixed(1) : "New"}</span>
                    </div>
                  </div>
                  
                  <p className="text-white/60 text-sm flex items-center gap-1 mb-4">
                    <MapPin size={14} />
                    {property.location}
                  </p>

                  <div className="mt-auto">
                    <p className="text-lg font-bold">
                      ₹{property.price?.toLocaleString()} <span className="text-sm font-normal text-white/50">/ night</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
