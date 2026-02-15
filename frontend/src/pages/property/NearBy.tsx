import { useNearByProperty } from "../../features/property/property.hooks";
import { useLiveLocation } from "../../hooks/useLiveLocation";
import MapView from "./MapView";

export default function NearBy() {
  const location = useLiveLocation();

  const { data, isLoading } = useNearByProperty(location?.lat, location?.lng);

  if (!location) {
    return <div>Getting your location...</div>;
  }

  if (isLoading) {
    return <div>Loading nearby properties...</div>;
  }

  return (
    <MapView
      properties={data?.data || []}
      userLat={location.lat}
      userLng={location.lng}
    />
  );
}
