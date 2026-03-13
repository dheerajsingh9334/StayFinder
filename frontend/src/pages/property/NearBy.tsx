import { useNearByProperty } from "../../features/property/property.hooks";
import { useLiveLocation } from "../../hooks/useLiveLocation";
import MapView from "../map/MapView";
import Loader from "../../components/ui/Loader";
import { MapPin, Navigation } from "lucide-react";

export default function NearBy() {
  const location = useLiveLocation();
  const { data, isLoading } = useNearByProperty(location?.lat, location?.lng);

  if (!location) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "var(--space-8)",
        textAlign: "center"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          background: "var(--primary-100)",
          borderRadius: "var(--radius-full)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-4)"
        }}>
          <Navigation size={28} style={{ color: "var(--primary-600)", animation: "pulse 2s infinite" }} />
        </div>
        <p style={{ fontWeight: "var(--font-medium)", marginBottom: "var(--space-1)" }}>
          Getting your location...
        </p>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)" }}>
          Please allow location access to see nearby properties
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: "var(--space-6)" }}>
        <Loader size="md" text="Finding properties near you..." />
      </div>
    );
  }

  const propertyCount = data?.data?.length || 0;

  return (
    <div>
      <div style={{ 
        padding: "var(--space-3) var(--space-4)", 
        borderBottom: "1px solid var(--gray-100)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <MapPin size={16} style={{ color: "var(--primary-500)" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>
            Your location
          </span>
        </div>
        <span className="badge badge-primary">
          {propertyCount} nearby
        </span>
      </div>
      <div style={{ height: "350px" }}>
        <MapView
          properties={data?.data || []}
          userLat={location.lat}
          userLng={location.lng}
        />
      </div>
    </div>
  );
}
