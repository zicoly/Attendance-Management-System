import { useState, useEffect } from "react";

export default function useLocation() {
  const [userLocation, setUserLocation] = useState<any>(null);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos: any) =>
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (error) => {
          console.error("Location access denied:", error);
        }
      );
    }
  };

  const calculateDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return {
    userLocation,
    calculateDistance,
  };
}
