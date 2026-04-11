import type { NearByProperty } from "../../features/property/property.types";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MapFollower from "./MapFollower";
import LocateLiveBtn from "./lacateLiveBtn";
import L from "leaflet";
type props = {
  properties?: NearByProperty[];
  userLat?: number;
  userLng?: number;
  focusLat?: number;
  focusLng?: number;
};

export default function MapView({
  properties = [],
  userLat,
  userLng,
  focusLat,
  focusLng,
}: props) {
  const parseCoordinate = (value: unknown) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const parsedFocusLat = parseCoordinate(focusLat);
  const parsedFocusLng = parseCoordinate(focusLng);
  const parsedUserLat = parseCoordinate(userLat);
  const parsedUserLng = parseCoordinate(userLng);

  const hasFocus = parsedFocusLat !== null && parsedFocusLng !== null;
  const hasUser = parsedUserLat !== null && parsedUserLng !== null;

  if (!hasFocus && !hasUser) return null;

  const centerLat = hasFocus ? parsedFocusLat! : parsedUserLat!;
  const centerLng = hasFocus ? parsedFocusLng! : parsedUserLng!;

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
      center={[centerLat, centerLng]}
      zoom={13}
      style={{ height: "100%", width: "100%", position: "relative" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hasUser && <LocateLiveBtn lat={parsedUserLat!} lng={parsedUserLng!} />}
      <MapFollower lat={centerLat} lng={centerLng} />
      {hasUser && (
        <Marker position={[parsedUserLat!, parsedUserLng!]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

// @ts-ignore
import MarkerClusterGroup from 'react-leaflet-cluster';

      <MarkerClusterGroup chunkedLoading>
        {properties.map((p) => {
          const propertyLat = parseCoordinate(p.lat);
          const propertyLng = parseCoordinate(p.lng);

          if (propertyLat === null || propertyLng === null) return null;

          return (
            <Marker
              key={p.id}
              position={[propertyLat, propertyLng]}
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
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
