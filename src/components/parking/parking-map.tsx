"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ParkingLot, Coordinates } from "@/domain/parking/types";

type ParkingMapProps = {
  lots: ParkingLot[];
  userLocation: Coordinates | null;
  selectedLotId: string | null;
  onSelectLot: (lot: ParkingLot) => void;
  center: Coordinates;
  onMapReady?: () => void;
};

export function ParkingMap({
  lots,
  userLocation,
  selectedLotId,
  onSelectLot,
  center,
  onMapReady,
}: ParkingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Center map on location
  const centerOnLocation = useCallback((location: Coordinates) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], 15, { animate: true });
    }
  }, []);

  // Listen for center-map events
  useEffect(() => {
    const handleCenterMap = (e: CustomEvent<Coordinates>) => {
      centerOnLocation(e.detail);
    };
    window.addEventListener("center-map", handleCenterMap as EventListener);
    return () => {
      window.removeEventListener("center-map", handleCenterMap as EventListener);
    };
  }, [centerOnLocation]);

  // Load Leaflet dynamically (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLeaflet = async () => {
      // Add Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      // Add custom marker styles
      if (!document.getElementById("parking-marker-styles")) {
        const style = document.createElement("style");
        style.id = "parking-marker-styles";
        style.textContent = `
          .price-marker {
            background: transparent;
            border: none;
          }
          .price-marker-content {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
          }
          .price-marker-content:hover {
            transform: scale(1.1);
          }
          .price-marker-selected .price-marker-content {
            transform: scale(1.15);
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          }
          .user-location-marker {
            background: transparent;
            border: none;
          }
        `;
        document.head.appendChild(style);
      }

      // Load Leaflet JS
      const L = await import("leaflet");
      
      if (!mapRef.current || mapInstanceRef.current) return;

      // Initialize map
      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([center.lat, center.lng], 15);

      // Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Add zoom control to bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
      setIsLoaded(true);
      onMapReady?.();
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center.lat, center.lng, onMapReady]);

  // Update markers when lots change
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const loadMarkers = async () => {
      const L = await import("leaflet");
      const map = mapInstanceRef.current!;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      // Create price pill marker
      const createPriceIcon = (lot: ParkingLot, isSelected: boolean) => {
        const availabilityPercent = (lot.availableSlots / lot.totalSlots) * 100;
        const isAvailable = lot.availableSlots > 0;
        
        // Color based on availability
        let bgColor = "#22c55e"; // green
        let textColor = "#ffffff";
        if (!isAvailable) {
          bgColor = "#9ca3af"; // gray
        } else if (availabilityPercent < 20) {
          bgColor = "#ef4444"; // red
        } else if (availabilityPercent < 50) {
          bgColor = "#f97316"; // orange
        }

        if (isSelected) {
          bgColor = "#2563eb"; // primary blue
        }

        return L.divIcon({
          className: `price-marker ${isSelected ? "price-marker-selected" : ""}`,
          html: `
            <div class="price-marker-content" style="background-color: ${bgColor}; color: ${textColor};">
              $${lot.pricePerHour}
            </div>
          `,
          iconSize: [60, 30],
          iconAnchor: [30, 15],
        });
      };

      // Add markers for each lot
      lots.forEach((lot) => {
        const isSelected = lot.id === selectedLotId;
        const marker = L.marker([lot.coordinates.lat, lot.coordinates.lng], {
          icon: createPriceIcon(lot, isSelected),
          zIndexOffset: isSelected ? 1000 : 0,
        })
          .addTo(map)
          .on("click", () => onSelectLot(lot));

        markersRef.current.set(lot.id, marker);
      });
    };

    loadMarkers();
  }, [lots, selectedLotId, isLoaded, onSelectLot]);

  // Update user location marker
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !userLocation) return;

    const loadUserMarker = async () => {
      const L = await import("leaflet");
      const map = mapInstanceRef.current!;

      // Remove existing user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // Create user location icon
      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `
          <div style="position: relative; width: 20px; height: 20px;">
            <div style="position: absolute; inset: 0; background: #2563eb; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
            <div style="position: absolute; inset: -6px; background: #2563eb; border-radius: 50%; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 2000,
      }).addTo(map);
    };

    loadUserMarker();
  }, [userLocation, isLoaded]);

  // Center map on selected lot
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !selectedLotId) return;

    const selectedLot = lots.find((lot) => lot.id === selectedLotId);
    if (selectedLot) {
      mapInstanceRef.current.setView(
        [selectedLot.coordinates.lat, selectedLot.coordinates.lng],
        16,
        { animate: true }
      );
    }
  }, [selectedLotId, lots, isLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
}
