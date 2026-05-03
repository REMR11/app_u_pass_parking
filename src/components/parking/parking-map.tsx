"use client";

import { useEffect, useRef, useState } from "react";
import type { ParkingLot, Coordinates } from "@/domain/parking/types";

type ParkingMapProps = {
  lots: ParkingLot[];
  userLocation: Coordinates | null;
  selectedLotId: string | null;
  onSelectLot: (lot: ParkingLot) => void;
  center: Coordinates;
};

export function ParkingMap({
  lots,
  userLocation,
  selectedLotId,
  onSelectLot,
  center,
}: ParkingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center.lat, center.lng]);

  // Update markers when lots change
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const loadMarkers = async () => {
      const L = await import("leaflet");
      const map = mapInstanceRef.current!;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Create custom icon for parking lots
      const createParkingIcon = (lot: ParkingLot, isSelected: boolean) => {
        const availabilityPercent = (lot.availableSlots / lot.totalSlots) * 100;
        let bgColor = "#22c55e"; // green - good availability
        if (availabilityPercent < 20) bgColor = "#ef4444"; // red - low
        else if (availabilityPercent < 50) bgColor = "#f59e0b"; // yellow - medium

        return L.divIcon({
          className: "parking-marker",
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                isSelected ? "scale-125" : ""
              }" style="background-color: ${isSelected ? "#2563eb" : bgColor}">
                <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/>
                </svg>
              </div>
              ${
                isSelected
                  ? `<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary"></div>`
                  : ""
              }
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });
      };

      // Add markers for each lot
      lots.forEach((lot) => {
        const isSelected = lot.id === selectedLotId;
        const marker = L.marker([lot.coordinates.lat, lot.coordinates.lng], {
          icon: createParkingIcon(lot, isSelected),
        })
          .addTo(map)
          .on("click", () => onSelectLot(lot));

        // Add popup with lot info
        marker.bindPopup(
          `
          <div class="min-w-[200px] p-1">
            <h3 class="font-semibold text-sm mb-1">${lot.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${lot.address}</p>
            <div class="flex items-center justify-between text-xs">
              <span class="text-green-600 font-medium">${lot.availableSlots} disponibles</span>
              <span class="font-semibold">$${lot.pricePerHour}/hr</span>
            </div>
          </div>
        `,
          { closeButton: false }
        );

        markersRef.current.push(marker);
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
        className: "user-marker",
        html: `
          <div class="relative">
            <div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"></div>
            <div class="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-75"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
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
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
      
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-20 left-3 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Alta disponibilidad</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Media disponibilidad</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Baja disponibilidad</span>
        </div>
      </div>
    </div>
  );
}
