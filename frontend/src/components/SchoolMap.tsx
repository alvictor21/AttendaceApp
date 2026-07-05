// components/SchoolMap.tsx
"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SCHOOL_LOCATION } from "../lib/school-config";

// Fix default icon Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

interface SchoolMapProps {
  userCoords: { lat: number; lng: number } | null;
}

export default function SchoolMap({ userCoords }: SchoolMapProps) {
  const mapKey = useRef(`school-map-${Date.now()}`); // key unik per instance, mencegah reuse container

  return (
    <MapContainer
      key={mapKey.current}
      center={[SCHOOL_LOCATION.latitude, SCHOOL_LOCATION.longitude]}
      zoom={17}
      style={{ height: "176px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <InvalidateMapSize />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <Marker position={[SCHOOL_LOCATION.latitude, SCHOOL_LOCATION.longitude]}>
        <Popup>{SCHOOL_LOCATION.name}</Popup>
      </Marker>
      <Circle
        center={[SCHOOL_LOCATION.latitude, SCHOOL_LOCATION.longitude]}
        radius={SCHOOL_LOCATION.radiusMeters}
        pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.15 }}
      />
      {userCoords && (
        <Marker position={[userCoords.lat, userCoords.lng]}>
          <Popup>Lokasi Anda</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}