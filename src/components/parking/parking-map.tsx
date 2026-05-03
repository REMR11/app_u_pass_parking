"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ParkingLot, Coordinates } from "@/domain/parking/types";

export type FilterMode = "recommended" | "nearby" | "cheapest";

type ParkingMapProps = {
  lots: ParkingLot[];
  userLocation: Coordinates | null;
  selectedLotId: string | null;
  onSelectLot: (lot: ParkingLot) => void;
  center: Coordinates;
  onMapReady?: () => void;
  filterMode?: FilterMode;
};

export function ParkingMap({
  lots,
  userLocation,
  selectedLotId,
  onSelectLot,
  center,
  onMapReady,
  filterMode = "recommended",
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
          /* Large facility: bigger pill with capacity badge */
          .price-marker-large .price-marker-content {
            padding: 7px 14px;
            border-radius: 22px;
            font-size: 14px;
            font-weight: 700;
          }
          /* Regional facility: smaller, lighter pill */
          .price-marker-regional .price-marker-content {
            padding: 5px 10px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            opacity: 0.92;
          }
          .price-marker-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
          }
          .price-marker-content:hover {
            transform: scale(1.1);
          }
          .price-marker-selected .price-marker-content {
            transform: scale(1.18);
            box-shadow: 0 4px 14px rgba(0,0,0,0.3);
          }
          .capacity-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: rgba(255,255,255,0.7);
            flex-shrink: 0;
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

      // Zoom control is rendered as custom JSX buttons below

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

      // Get ranking position for each filter mode
      const getRankings = () => {
        const byAvailability = [...lots].sort((a, b) => 
          (b.availableSlots / b.totalSlots) - (a.availableSlots / a.totalSlots)
        );
        const byDistance = [...lots].sort((a, b) => a.distanceMeters - b.distanceMeters);
        const byPrice = [...lots].sort((a, b) => a.pricePerHour - b.pricePerHour);
        
        return { byAvailability, byDistance, byPrice };
      };
      
      const rankings = getRankings();
      
      // Create price pill marker with filter-aware colors
      const createPriceIcon = (lot: ParkingLot, isSelected: boolean) => {
        const isAvailable = lot.availableSlots > 0;
        const textColor = "#ffffff"; // always white on colored backgrounds
        let bgColor = "#9ca3af"; // gray for unavailable
        
        if (!isAvailable) {
          bgColor = "#9ca3af";
        } else if (isSelected) {
          bgColor = "#2563eb"; // primary blue when selected
        } else {
          // Color based on filter mode ranking
          let rankingList: ParkingLot[];
          
          switch (filterMode) {
            case "nearby":
              rankingList = rankings.byDistance;
              break;
            case "cheapest":
              rankingList = rankings.byPrice;
              break;
            case "recommended":
            default:
              rankingList = rankings.byAvailability;
              break;
          }
          
          const rank = rankingList.findIndex(l => l.id === lot.id);
          const totalAvailable = rankingList.filter(l => l.availableSlots > 0).length;
          const percentile = rank / totalAvailable;
          
          // Gradient: green (best) -> yellow -> orange -> red (worst)
          if (percentile <= 0.25) {
            bgColor = "#22c55e"; // green - top 25%
          } else if (percentile <= 0.5) {
            bgColor = "#84cc16"; // lime - top 50%
          } else if (percentile <= 0.75) {
            bgColor = "#f59e0b"; // amber - top 75%
          } else {
            bgColor = "#f97316"; // orange - bottom 25%
          }
        }

        const isLarge = lot.facilityType === "large";
        // Large lots get a bigger pill; regional lots get a compact one
        const iconW = isLarge ? 86 : 70;
        const iconH = isLarge ? 34 : 28;

        return L.divIcon({
          className: `price-marker ${isSelected ? "price-marker-selected" : ""} price-marker-${lot.facilityType}`,
          html: `
            <div class="price-marker-content" style="background-color: ${bgColor}; color: ${textColor};">
              ${isLarge ? '<span class="capacity-dot"></span>' : ""}
              $${lot.pricePerHour.toFixed(2)}
            </div>
          `,
          iconSize: [iconW, iconH],
          iconAnchor: [iconW / 2, iconH / 2],
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
  }, [lots, selectedLotId, isLoaded, onSelectLot, filterMode]);

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

  // Expose zoom controls to parent via an imperative ref pattern using window events
  useEffect(() => {
    const handleZoomIn = () => { if (mapInstanceRef.current) mapInstanceRef.current.zoomIn(); };
    const handleZoomOut = () => { if (mapInstanceRef.current) mapInstanceRef.current.zoomOut(); };
    window.addEventListener("map-zoom-in", handleZoomIn);
    window.addEventListener("map-zoom-out", handleZoomOut);
    return () => {
      window.removeEventListener("map-zoom-in", handleZoomIn);
      window.removeEventListener("map-zoom-out", handleZoomOut);
    };
  }, []);

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
