// hooks/useDistanceToSchool.ts
import { useState, useEffect } from "react";
import { SCHOOL_LOCATION } from "../lib/school-config";

interface DistanceState {
  distance: number | null; // meter
  isWithinRadius: boolean;
  loading: boolean;
  error: string | null;
  userCoords: { lat: number; lng: number } | null;
}

// Rumus Haversine: menghitung jarak antara 2 titik koordinat bumi (dalam meter)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // radius bumi dalam meter
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // hasil dalam meter
}

export function useDistanceToSchool() {
  const [state, setState] = useState<DistanceState>({
    distance: null,
    isWithinRadius: false,
    loading: true,
    error: null,
    userCoords: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Geolocation tidak didukung browser ini.",
      }));
      return;
    }

    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const distance = calculateDistance(
          latitude,
          longitude,
          SCHOOL_LOCATION.latitude,
          SCHOOL_LOCATION.longitude
        );

        setState({
          distance: Math.round(distance),
          isWithinRadius: distance <= SCHOOL_LOCATION.radiusMeters,
          loading: false,
          error: null,
          userCoords: { lat: latitude, lng: longitude },
        });
      },
      (err) => {
        setState((s) => ({
          ...s,
          loading: false,
          error:
            err.code === err.PERMISSION_DENIED
              ? "Izin lokasi ditolak. Aktifkan GPS untuk absen."
              : "Gagal mendapatkan lokasi.",
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // watchPosition dipakai (bukan getCurrentPosition) supaya jarak ter-update
    // otomatis kalau user bergerak, tanpa perlu refresh halaman
    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  return state;
}