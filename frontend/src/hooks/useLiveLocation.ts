import { useEffect, useState } from "react";

export const useLiveLocation = () => {
  const [location, setlocation] = useState<{
    lat: number;
    lng: number;
  }>();

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setlocation({
          lat: latitude,
          lng: longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  return location;
};
