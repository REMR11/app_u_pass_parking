"use client";

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { ParkingLot, Coordinates } from "@/domain/parking/types";
import type { ParkingMapFilterMode } from "@/lib/parking/map-filter-mode";
import { buildLotRankings, getPriceMarkerBackground } from "@/lib/parking/map-marker-ranking";

/** @deprecated Usa ParkingMapFilterMode desde `@/lib/parking/map-filter-mode`. */
export type FilterMode = ParkingMapFilterMode;

export type ParkingMapHandle = {
  centerOn: (location: Coordinates, zoom?: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

type ParkingMapProps = {
  lots: ParkingLot[];
  userLocation: Coordinates | null;
  selectedLotId: string | null;
  onSelectLot: (lot: ParkingLot) => void;
  center: Coordinates;
  onMapReady?: () => void;
  filterMode?: ParkingMapFilterMode;
};

export const ParkingMap = forwardRef<ParkingMapHandle, ParkingMapProps>(
  function ParkingMap(
    {
      lots,
      userLocation,
      selectedLotId,
      onSelectLot,
      center,
      onMapReady,
      filterMode = "recommended",
    },
    ref,
  ) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
    const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
    const userMarkerRef = useRef<import("leaflet").Marker | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        centerOn: (location: Coordinates, zoom = 15) => {
          try {
            mapInstanceRef.current?.setView([location.lat, location.lng], zoom, {
              animate: true,
            });
          } catch {
            /* ignore */
          }
        },
        zoomIn: () => {
          try {
            mapInstanceRef.current?.zoomIn();
          } catch {
            /* ignore */
          }
        },
        zoomOut: () => {
          try {
            mapInstanceRef.current?.zoomOut();
          } catch {
            /* ignore */
          }
        },
      }),
      [],
    );

    // Load Leaflet (client-side only)
    useEffect(() => {
      if (typeof window === "undefined") return;

      const loadLeaflet = async () => {
        const L = await import("leaflet");

        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
          zoomControl: false,
        }).setView([center.lat, center.lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsLoaded(true);
        onMapReady?.();
      };

      void loadLeaflet();

      const currentMarkers = markersRef.current;

      return () => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.stop();
            mapInstanceRef.current.remove();
          } catch {
            /* cleanup */
          }
          mapInstanceRef.current = null;
          currentMarkers.clear();
          userMarkerRef.current = null;
        }
      };
    }, [center.lat, center.lng, onMapReady]);

    // Update markers when lots change
    useEffect(() => {
      if (!isLoaded || !mapInstanceRef.current) return;

      const loadMarkers = async () => {
        const L = await import("leaflet");
        const map = mapInstanceRef.current!;

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();

        const rankings = buildLotRankings(lots);

        const createPriceIcon = (lot: ParkingLot, isSelected: boolean) => {
          const bgColor = getPriceMarkerBackground({
            lot,
            isSelected,
            filterMode,
            rankings,
          });
          const textColor = "#ffffff";

          const isLarge = lot.facilityType === "large";
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

      void loadMarkers();
    }, [lots, selectedLotId, isLoaded, onSelectLot, filterMode]);

    // User location marker
    useEffect(() => {
      if (!isLoaded || !mapInstanceRef.current || !userLocation) return;

      const loadUserMarker = async () => {
        const L = await import("leaflet");
        const map = mapInstanceRef.current!;

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: `
          <div style="position: relative; width: 20px; height: 20px;">
            <div class="user-location-dot"></div>
            <div class="user-location-pulse"></div>
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

      void loadUserMarker();
    }, [userLocation, isLoaded]);

    // Centrar en lote seleccionado
    useEffect(() => {
      if (!isLoaded || !mapInstanceRef.current || !selectedLotId) return;

      const selected = lots.find((lot) => lot.id === selectedLotId);
      if (selected) {
        mapInstanceRef.current.setView(
          [selected.coordinates.lat, selected.coordinates.lng],
          16,
          { animate: true },
        );
      }
    }, [selectedLotId, lots, isLoaded]);

    return (
      <div className="relative w-full h-full">
        <div ref={mapRef} className="w-full h-full" />

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
  },
);
