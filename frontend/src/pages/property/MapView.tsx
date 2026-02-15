import React from "react";
import type { NearByProperty } from "../../features/property/property.types";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
type props = {
  properties?: NearByProperty[];
  userLat?: number;
  userLng?: number;
};

export default function MapView({ properties = [], userLat, userLng }: props) {
  if (!userLat || !userLng) return null;

  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[userLat, userLng]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>

      {properties.map((p) =>
        p.lat && p.lng ? (
          <Marker key={p.id} position={[p.lat, p.lng]} title={p.title}>
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
