import { useEffect } from "react";
import { useMap } from "react-leaflet";

type Props = {
  lat?: number;
  lng?: number;
};
export default function MapFollower({ lat, lng }: Props) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") {
      map.setView([lat, lng], map.getZoom(), {
        animate: true,
      });
    }
  }, [lat, lng, map]);
  return null;
}
