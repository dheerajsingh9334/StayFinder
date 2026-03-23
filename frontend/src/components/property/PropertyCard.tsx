import React from "react";
import { MapPin, Users, Bed, Star, Heart } from "lucide-react";
import type {
  PropertyPayload,
  NearByProperty,
} from "../../features/property/property.types";

type PropertyCardData = PropertyPayload | NearByProperty;

interface PropertyCardProps {
  property: PropertyCardData;
  onClick?: () => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export default function PropertyCard({
  property,
  onClick,
  onFavorite,
  isFavorite = false,
}: PropertyCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(property.id);
  };

  const image =
    property.images?.[0] ||
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800";
  const rating = Number(property.averageRating || 0);
  const title = property.title || "Untitled Property";
  const city = property.city || "Unknown";
  const state = property.state || "Location";
  const price = Number(property.price || 0);

  // Check if property has capacity (PropertyPayload) or not (NearByProperty)
  const capacity = "capacity" in property ? property.capacity : undefined;
  const bedrooms = "bedrooms" in property ? property.bedrooms : undefined;

  return (
    <div className="property-card" onClick={onClick}>
      <div className="property-card-image">
        <img src={image} alt={title} loading="lazy" />

        <button
          className={`property-card-favorite ${isFavorite ? "active" : ""}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>

        {rating > 4.5 && (
          <span className="property-card-badge">Guest Favorite</span>
        )}
      </div>

      <div className="property-card-content">
        <div className="property-card-location">
          <MapPin size={14} />
          <span>
            {city}, {state}
          </span>
        </div>

        <h3 className="property-card-title">{title}</h3>

        <div className="property-card-details">
          {capacity && (
            <div className="property-card-detail">
              <Users size={14} />
              <span>{capacity} guests</span>
            </div>
          )}
          {bedrooms && (
            <div className="property-card-detail">
              <Bed size={14} />
              <span>{bedrooms} beds</span>
            </div>
          )}
        </div>

        <div className="property-card-footer">
          <div className="property-card-rating">
            <Star size={14} fill="currentColor" />
            <span>{rating > 0 ? rating.toFixed(1) : "New"}</span>
          </div>

          <div className="property-card-price">
            ₹{price.toLocaleString()}
            <span>/night</span>
          </div>
        </div>
      </div>
    </div>
  );
}
