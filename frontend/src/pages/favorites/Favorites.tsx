import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import Loader from "../../components/ui/Loader";
import { api } from "../../services/api";
import toast from "react-hot-toast";

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
  };
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          name: item.property.city || "Favorite Property",
          images: item.property.images || [],
          price: Number(item.property.price || 0),
          rating: Number(item.property.averageRating || 0),
          location: item.property.city || "Unknown",
          city: item.property.city,
          state: item.property.country,
        }));
      setFavorites(normalized);
    } catch (error: unknown) {
      const err = error as any;
      toast.error(err.response?.data?.message || "Failed to load favorites");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (propertyId: string) => {
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
    <div className="page-container">
      <div className="page-header">
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            alignItems: "center",
          }}
        >
          <Heart
            size={32}
            color="var(--primary-600)"
            fill="var(--primary-600)"
          />
          <div>
            <h1 className="page-title">My Favorites</h1>
            <p className="page-subtitle">{favorites.length} properties saved</p>
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <Heart size={32} />
          <h3 className="empty-state-title">No favorites yet</h3>
          <p className="empty-state-description">
            Start saving properties you love to keep them handy
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {favorites.map((property) => (
            <div
              key={property.id}
              style={{ position: "relative" }}
              className="card"
            >
              <div
                style={{
                  height: "200px",
                  background: "var(--gray-100)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "var(--space-3)",
                  backgroundImage: property.images?.[0]
                    ? `url(${property.images[0]})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <h3 style={{ fontWeight: "600", marginBottom: "var(--space-2)" }}>
                {property.name || property.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--gray-500)",
                  marginBottom: "var(--space-2)",
                }}
              >
                {property.location}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p style={{ fontWeight: "700", color: "var(--primary-600)" }}>
                  ₹{property.price?.toLocaleString()}
                </p>
                <button
                  onClick={() => handleRemove(property.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "var(--space-2)",
                    color: "var(--primary-600)",
                  }}
                >
                  <Heart size={20} fill="var(--primary-600)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
