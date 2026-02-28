import type { NearByProperty } from "../../features/property/property.types";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MapFollower from "./MapFollower";
import LocateLiveBtn from "./lacateLiveBtn";
import L from "leaflet";
type props = {
  properties?: NearByProperty[];
  userLat?: number;
  userLng?: number;
};

export default function MapView({ properties = [], userLat, userLng }: props) {
  if (!userLat || !userLng) return null;
  const userIcon = new L.Icon({
    iconUrl: "/user-marker.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const propertyIcon = new L.Icon({
    iconUrl: "/property-marker.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={12}
      style={{ height: "100vh", width: "100%", position: "relative" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocateLiveBtn lat={userLat} lng={userLng} />
      <MapFollower lat={userLat} lng={userLng} />
      <Marker position={[userLat, userLng]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>

      {properties.map((p) =>
        p.lat && p.lng ? (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={propertyIcon}
            title={p.title}
          >
            <Popup>
              <div>
                <strong>{p.title}</strong>
                <br />
                <h1>{p.price}</h1>
              </div>
            </Popup>
          </Marker>
        ) : null,
      )}
    </MapContainer>
  );
}
