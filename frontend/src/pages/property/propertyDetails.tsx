import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { UpdatePropertyPayload } from "../../features/property/property.types";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  useUpdateProperty,
  usePropertyDetails,
} from "../../features/property/property.hooks";
import CalendarView from "../availbility/CalenderView";
import MapView from "../map/MapView";
import { useLiveLocation } from "../../hooks/useLiveLocation";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  Edit2,
  Wifi,
  Car,
  Wind,
  UtensilsCrossed,
  Check,
  ChevronLeft,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input, { Textarea } from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi size={18} />,
  ac: <Wind size={18} />,
  parking: <Car size={18} />,
  kitchen: <UtensilsCrossed size={18} />,
};

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { data: current, isLoading, isError, error } = usePropertyDetails(id!);
  const updateProperty = useUpdateProperty();
  const userlocation = useLiveLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdatePropertyPayload | null>(null);

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  if (isLoading || !current) {
    return <Loader size="lg" text="Loading property details..." />;
  }

  const isOwner = user?.id === current.owner?.id;
  const mainImage =
    current.images?.[0] ||
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

  const handleEditStart = () => {
    setForm({
      title: current.title,
      description: current.description,
      price: current.price,
      state: current.state,
      city: current.city,
      capacity: current.capacity,
      bedrooms: current.bedrooms,
      bathrooms: current.bathrooms,
      images: current.images ?? [],
      amenities: current.amenities ?? [],
      lat: current.lat ?? undefined,
      lng: current.lng ?? undefined,
      address: current.address ?? undefined,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!id || !form) return;
    updateProperty.mutate(
      { id, data: form },
      {
        onSuccess: () => {
          toast.success("Property updated successfully");
          setIsEditing(false);
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm(null);
  };

  const toggleAmenity = (amenity: string) => {
    if (!form) return;
    setForm({
      ...form,
      amenities: form.amenities?.includes(amenity)
        ? form.amenities.filter((a) => a !== amenity)
        : [...(form.amenities ?? []), amenity],
    });
  };

  const Amenities = [
    "wifi",
    "ac",
    "parking",
    "kitchen",
    "tissue",
    "fresh-pillow",
    "fresh-flowers",
  ] as const;

  const handleBook = () => {
    navigate(`/booking/new?propertyId=${current.id}`);
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost"
        style={{ marginBottom: "var(--space-4)" }}
      >
        <ChevronLeft size={20} />
        Back to listings
      </button>

      <div className="property-details">
        {/* Main Content */}
        <div className="property-main">
          {/* Gallery */}
          <div className="property-gallery">
            <img src={mainImage} alt={current.title} />
            {current.images && current.images.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "var(--space-4)",
                  right: "var(--space-4)",
                  background: "var(--white)",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-medium)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                +{current.images.length - 1} more photos
              </div>
            )}
          </div>

          <div className="property-content">
            {/* Header */}
            <div className="property-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h1 className="property-title">{current.title}</h1>
                  <div className="property-location">
                    <MapPin size={18} />
                    <span>
                      {current.address || current.city}, {current.state},{" "}
                      {current.country}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                  }}
                >
                  <Star
                    size={18}
                    fill="var(--accent-amber)"
                    color="var(--accent-amber)"
                  />
                  <span style={{ fontWeight: "var(--font-semibold)" }}>
                    {current.averageRating > 0
                      ? current.averageRating.toFixed(1)
                      : "New"}
                  </span>
                  <span style={{ color: "var(--gray-500)" }}>
                    ({current.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {isOwner && !isEditing && (
                <Button
                  variant="outline"
                  onClick={handleEditStart}
                  leftIcon={<Edit2 size={16} />}
                  style={{ marginTop: "var(--space-4)" }}
                >
                  Edit Property
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="property-stats">
              <div className="property-stat">
                <Users size={20} className="property-stat-icon" />
                <span>{current.capacity} guests</span>
              </div>
              <div className="property-stat">
                <Bed size={20} className="property-stat-icon" />
                <span>{current.bedrooms} bedrooms</span>
              </div>
              <div className="property-stat">
                <Bath size={20} className="property-stat-icon" />
                <span>{current.bathrooms} bathrooms</span>
              </div>
            </div>

            {!isEditing ? (
              <>
                {/* Description */}
                <div className="property-section">
                  <h3 className="property-section-title">About this place</h3>
                  <p className="property-description">{current.description}</p>
                </div>

                {/* Amenities */}
                <div className="property-section">
                  <h3 className="property-section-title">Amenities</h3>
                  <div className="amenities">
                    {current.amenities?.map((amenity, i) => (
                      <div key={i} className="amenity">
                        {amenityIcons[amenity.toLowerCase()] || (
                          <Check size={18} />
                        )}
                        <span style={{ textTransform: "capitalize" }}>
                          {amenity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Host Info */}
                <div className="property-section">
                  <h3 className="property-section-title">Hosted by</h3>
                  <div className="property-host">
                    <div className="avatar avatar-lg">
                      {current.owner?.avatarUrl ? (
                        <img
                          src={current.owner.avatarUrl}
                          alt={current.owner.name}
                        />
                      ) : (
                        current.owner?.name?.charAt(0).toUpperCase() || "H"
                      )}
                    </div>
                    <div className="property-host-info">
                      <h4>{current.owner?.name || "Host"}</h4>
                      {current.owner?.phone && (
                        <p>Contact: {current.owner.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="property-section">
                  <h3 className="property-section-title">Location</h3>
                  <div className="map-container">
                    <MapView
                      properties={[
                        {
                          id: current.id,
                          title: current.title,
                          price: current.price,
                          state: current.state,
                          city: current.city,
                          lat: current.lat ?? null,
                          lng: current.lng ?? null,
                          images: current.images ?? [],
                          averageRating: current.averageRating ?? 0,
                          availability: current.availability ?? [],
                        },
                      ]}
                      userLat={userlocation?.lat}
                      userLng={userlocation?.lng}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Edit Form */
              form && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-4)",
                  }}
                >
                  <Input
                    label="Title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                  <Textarea
                    label="Description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                  <div className="form-row">
                    <Input
                      label="Price per night (₹)"
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: Number(e.target.value) })
                      }
                    />
                    <Input
                      label="Capacity"
                      type="number"
                      value={form.capacity}
                      onChange={(e) =>
                        setForm({ ...form, capacity: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label="City"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                    <Input
                      label="State"
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Amenities</label>
                    <div
                      className="amenities"
                      style={{ marginTop: "var(--space-2)" }}
                    >
                      {Amenities.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleAmenity(a)}
                          className={`amenity ${form.amenities?.includes(a) ? "selected" : ""}`}
                          style={{ cursor: "pointer" }}
                        >
                          {amenityIcons[a] || <Check size={18} />}
                          <span style={{ textTransform: "capitalize" }}>
                            {a}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--space-3)",
                      marginTop: "var(--space-4)",
                    }}
                  >
                    <Button
                      onClick={handleSave}
                      isLoading={updateProperty.isPending}
                    >
                      Save Changes
                    </Button>
                    <Button variant="secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="booking-sidebar">
          <div className="booking-sidebar-header">
            <div className="booking-price">
              ₹{current.price.toLocaleString()}
              <span> / night</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                marginTop: "var(--space-2)",
              }}
            >
              <Star
                size={14}
                fill="var(--accent-amber)"
                color="var(--accent-amber)"
              />
              <span
                style={{
                  fontWeight: "var(--font-medium)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {current.averageRating > 0
                  ? current.averageRating.toFixed(1)
                  : "New"}
              </span>
              <span style={{ color: "var(--gray-400)" }}>·</span>
              <span
                style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}
              >
                {current.reviewCount} reviews
              </span>
            </div>
          </div>

          <div className="booking-sidebar-content">
            <CalendarView propertyId={id!} />
          </div>

          <div className="booking-sidebar-footer">
            {!user ? (
              <Button fullWidth onClick={() => navigate("/login")}>
                Login to Book
              </Button>
            ) : !isOwner ? (
              <Button fullWidth onClick={handleBook}>
                Reserve Now
              </Button>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--gray-500)",
                  fontSize: "var(--text-sm)",
                }}
              >
                This is your property
              </p>
            )}
            <p
              style={{
                textAlign: "center",
                color: "var(--gray-500)",
                fontSize: "var(--text-xs)",
                marginTop: "var(--space-3)",
              }}
            >
              You won't be charged yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
