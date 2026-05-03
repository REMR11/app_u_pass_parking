"use client";

import { useState, useMemo } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { ParkingGrid } from "@/components/parking/parking-grid";
import { SlotDetailsSheet } from "@/components/parking/slot-details-sheet";
import { ParkingLotCard } from "@/components/parking/parking-lot-card";
import { LevelSelector } from "@/components/parking/level-selector";
import { FilterTabs, type FilterType } from "@/components/parking/filter-tabs";
import { 
  listParkingLots, 
  getNearbyParkingLots, 
  getRecommendedLots, 
  getCheapestLots 
} from "@/lib/parking/parking-lots-store";
import type { ParkingSlot, ParkingLot, ParkingLevel } from "@/domain/parking/types";

type ViewMode = "lots" | "slots";

export default function ParkingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("lots");
  const [activeFilter, setActiveFilter] = useState<FilterType>("recommended");
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

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

  // Get recommendation type for each lot
  const getRecommendation = (lot: ParkingLot, index: number) => {
    if (activeFilter === "recommended" && index === 0) return "best" as const;
    if (activeFilter === "nearest" && index === 0) return "nearest" as const;
    if (activeFilter === "cheapest" && index === 0) return "cheapest" as const;
    return undefined;
  };

  // Handle lot selection
  const handleSelectLot = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setSelectedLevelId(lot.levels[0]?.id || null);
    setViewMode("slots");
    setSelectedSlot(null);
  };

  // Handle back to lots view
  const handleBackToLots = () => {
    setViewMode("lots");
    setSelectedLot(null);
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

  return (
    <div className="min-h-screen bg-background">
      {viewMode === "lots" ? (
        <>
          {/* Header */}
          <MobileHeader
            title="Encuentra tu lugar"
            subtitle="en segundos"
          />

          {/* Content */}
          <div className="px-4 py-6 space-y-6">
            {/* Filter tabs */}
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {/* Parking lots list */}
            <div className="space-y-3">
              {filteredLots.map((lot, index) => (
                <ParkingLotCard
                  key={lot.id}
                  lot={lot}
                  isSelected={selectedLot?.id === lot.id}
                  onSelect={() => handleSelectLot(lot)}
                  recommendation={getRecommendation(lot, index)}
                />
              ))}
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
              onClick={handleBackToLots}
              className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver a estacionamientos
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
            <div className="px-4 pb-6">
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
