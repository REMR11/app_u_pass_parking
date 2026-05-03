"use client";

import { useState, useMemo, useEffect } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { ParkingGrid } from "@/components/parking/parking-grid";
import { SlotDetailsSheet } from "@/components/parking/slot-details-sheet";
import { ParkingMap } from "@/components/parking/parking-map";
import { LotPreviewCard } from "@/components/parking/lot-preview-card";
import { LevelSelector } from "@/components/parking/level-selector";
import { FilterTabs, type FilterType } from "@/components/parking/filter-tabs";
import { 
  getNearbyParkingLots, 
  getRecommendedLots, 
  getCheapestLots,
  DEFAULT_CENTER,
} from "@/lib/parking/parking-lots-store";
import type { ParkingSlot, ParkingLot, Coordinates } from "@/domain/parking/types";

type ViewMode = "map" | "slots";

export default function ParkingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [activeFilter, setActiveFilter] = useState<FilterType>("recommended");
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        () => {
          // Use default center if geolocation fails
          setUserLocation(DEFAULT_CENTER);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Get filtered parking lots based on active filter
  const filteredLots = useMemo(() => {
    switch (activeFilter) {
      case "nearest":
        return getNearbyParkingLots();
      case "cheapest":
        return getCheapestLots();
      case "recommended":
      default:
        return getRecommendedLots();
    }
  }, [activeFilter]);

  // Handle lot selection from map
  const handleSelectLotFromMap = (lot: ParkingLot) => {
    setSelectedLot(lot);
  };

  // Handle viewing lot details (slots)
  const handleViewLotDetails = () => {
    if (selectedLot) {
      setSelectedLevelId(selectedLot.levels[0]?.id || null);
      setViewMode("slots");
      setSelectedSlot(null);
    }
  };

  // Handle back to map view
  const handleBackToMap = () => {
    setViewMode("map");
    setSelectedLevelId(null);
    setSelectedSlot(null);
  };

  // Get current level
  const currentLevel = useMemo(() => {
    if (!selectedLot || !selectedLevelId) return null;
    return selectedLot.levels.find(l => l.id === selectedLevelId) || null;
  }, [selectedLot, selectedLevelId]);

  // Handle slot selection
  const handleSelectSlot = (slot: ParkingSlot) => {
    if (slot.status === "available") {
      setSelectedSlot(slot);
    }
  };

  // Handle reservation
  const handleReserve = () => {
    if (selectedSlot && selectedLot) {
      // TODO: Implement actual reservation logic
      alert(`Reservando lugar ${selectedSlot.code} en ${selectedLot.name}`);
    }
  };

  // Map center based on user location or default
  const mapCenter = userLocation || DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {viewMode === "map" ? (
        <>
          {/* Header */}
          <MobileHeader
            title="Encuentra tu lugar"
            subtitle="en segundos"
          />

          {/* Filter tabs - floating over map */}
          <div className="px-4 pt-4 pb-2 relative z-10">
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          {/* Map container */}
          <div className="flex-1 relative px-4 pb-4">
            <ParkingMap
              lots={filteredLots}
              userLocation={userLocation}
              selectedLotId={selectedLot?.id || null}
              onSelectLot={handleSelectLotFromMap}
              center={mapCenter}
            />

            {/* Locate me button */}
            <button
              onClick={() => {
                if (userLocation && typeof window !== "undefined") {
                  // Center map on user location - dispatch custom event
                  window.dispatchEvent(new CustomEvent("center-map", { 
                    detail: userLocation 
                  }));
                }
              }}
              disabled={isLocating}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
              aria-label="Mi ubicacion"
            >
              {isLocating ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
              )}
            </button>

            {/* Selected lot preview card */}
            {selectedLot && (
              <LotPreviewCard
                lot={selectedLot}
                onViewDetails={handleViewLotDetails}
                onClose={() => setSelectedLot(null)}
              />
            )}
          </div>

          {/* Quick stats bar */}
          <div className="px-4 pb-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{filteredLots.length}</p>
                  <p className="text-xs text-muted-foreground">Estacionamientos</p>
                </div>
                <div className="w-px h-10 bg-muted" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {filteredLots.reduce((acc, lot) => acc + lot.availableSlots, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Lugares libres</p>
                </div>
                <div className="w-px h-10 bg-muted" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    ${Math.min(...filteredLots.map(l => l.pricePerHour))}
                  </p>
                  <p className="text-xs text-muted-foreground">Desde/hora</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Slots view header */}
          <MobileHeader
            title={selectedLot?.name || "Seleccionar lugar"}
            subtitle={selectedLot?.address}
          />

          {/* Back button */}
          <div className="px-4 pt-4">
            <button
              onClick={handleBackToMap}
              className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver al mapa
            </button>
          </div>

          {/* Level selector */}
          {selectedLot && (
            <div className="px-4 py-4">
              <LevelSelector
                levels={selectedLot.levels}
                selectedLevelId={selectedLevelId || ""}
                onSelectLevel={setSelectedLevelId}
              />
            </div>
          )}

          {/* Parking grid */}
          {currentLevel && (
            <div className="px-4 pb-6 flex-1">
              <div className="mb-3">
                <p className="text-sm text-foreground/60">
                  {currentLevel.name} - {currentLevel.aisle}
                </p>
              </div>
              <ParkingGrid
                slots={currentLevel.slots}
                selectedSlotId={selectedSlot?.id || null}
                onSelectSlot={handleSelectSlot}
              />
            </div>
          )}

          {/* Slot details sheet */}
          <SlotDetailsSheet
            slot={selectedSlot}
            level={currentLevel}
            lot={selectedLot}
            onReserve={handleReserve}
            onClose={() => setSelectedSlot(null)}
          />
        </>
      )}
    </div>
  );
}
