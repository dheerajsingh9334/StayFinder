import React from "react";
import { useMap } from "react-leaflet";

type Props = {
  lat?: number;
  lng?: number;
};
export default function LocateLiveBtn({ lat, lng }: Props) {
  const map = useMap();

  const handleClick = () => {
    if (typeof lat === "number" && typeof lng === "number") {
      map.flyTo([lat, lng], 15, {
        animate: true,
      });
    }
  };
  return (
    <div>
      <button
        onClick={handleClick}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          padding: "8px 12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        📍 My Location
      </button>
    </div>
  );
}
