"use client";

import { useState, useMemo, useEffect } from "react";
import { ParkingGrid } from "@/components/parking/parking-grid";
import { SlotDetailsSheet } from "@/components/parking/slot-details-sheet";
import { ParkingMap } from "@/components/parking/parking-map";
import { ParkingListCard } from "@/components/parking/parking-list-card";
import { LevelSelector } from "@/components/parking/level-selector";
import { FilterTabs, type FilterType } from "@/components/parking/filter-tabs";
import { 
  getNearbyParkingLots, 
  getRecommendedLots, 
  getCheapestLots,
  DEFAULT_CENTER,
} from "@/lib/parking/parking-lots-store";
import type { ParkingSlot, ParkingLot, Coordinates } from "@/domain/parking/types";

type ViewMode = "list" | "slots";

export default function ParkingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeFilter, setActiveFilter] = useState<FilterType>("recommended");
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
          setUserLocation(DEFAULT_CENTER);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Get filtered parking lots based on active filter
  const filteredLots = useMemo(() => {
    let lots: ParkingLot[];
    switch (activeFilter) {
      case "nearest":
        lots = getNearbyParkingLots();
        break;
      case "cheapest":
        lots = getCheapestLots();
        break;
      case "recommended":
      default:
        lots = getRecommendedLots();
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      lots = lots.filter(
        (lot) =>
          lot.name.toLowerCase().includes(query) ||
          lot.address.toLowerCase().includes(query)
      );
    }

    return lots;
  }, [activeFilter, searchQuery]);

  // Handle lot selection
  const handleSelectLot = (lot: ParkingLot) => {
    setSelectedLot(lot);
  };

  // Handle viewing lot details (slots)
  const handleViewLotDetails = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setSelectedLevelId(lot.levels[0]?.id || null);
    setViewMode("slots");
    setSelectedSlot(null);
  };

  // Handle back to list view
  const handleBackToList = () => {
    setViewMode("list");
    setSelectedLevelId(null);
    setSelectedSlot(null);
  };

  // Get current level
  const currentLevel = useMemo(() => {
    if (!selectedLot || !selectedLevelId) return null;
    return selectedLot.levels.find((l) => l.id === selectedLevelId) || null;
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
      alert(`Reservando lugar ${selectedSlot.code} en ${selectedLot.name}`);
    }
  };

  // Map center
  const mapCenter = userLocation || DEFAULT_CENTER;

  // Count available lots
  const availableLots = filteredLots.filter((l) => l.availableSlots > 0);

  if (viewMode === "slots" && selectedLot) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="bg-primary text-primary-foreground px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Volver"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-semibold text-lg">{selectedLot.name}</h1>
              <p className="text-sm text-white/70">{selectedLot.address}</p>
            </div>
          </div>
        </header>

        {/* Level selector */}
        <div className="px-4 py-4 border-b border-muted">
          <LevelSelector
            levels={selectedLot.levels}
            selectedLevelId={selectedLevelId || ""}
            onSelectLevel={setSelectedLevelId}
          />
        </div>

        {/* Parking grid */}
        {currentLevel && (
          <div className="flex-1 px-4 py-4 overflow-auto">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {currentLevel.name} - {currentLevel.aisle}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-muted border border-muted-foreground/30" />
                  Disponible
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-primary/20" />
                  Ocupado
                </span>
              </div>
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
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-background">
      {/* Left sidebar - List */}
      <aside className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col border-r border-muted bg-background z-10 h-[50vh] lg:h-full">
        {/* Header */}
        <header className="px-4 py-4 border-b border-muted">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">U</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">U-Pass</h1>
              <p className="text-xs text-muted-foreground">Estacionamientos disponibles</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, direccion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-muted bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </header>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-muted">
          <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Results count */}
        <div className="px-4 py-2 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{availableLots.length}</span> estacionamientos disponibles
        </div>

        {/* Parking list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 scrollbar-hide">
          {filteredLots.map((lot, index) => (
            <ParkingListCard
              key={lot.id}
              lot={lot}
              isSelected={selectedLot?.id === lot.id}
              onSelect={handleSelectLot}
              rank={index + 1}
            />
          ))}

          {filteredLots.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron estacionamientos</p>
            </div>
          )}
        </div>

        {/* View details button (mobile) */}
        {selectedLot && (
          <div className="lg:hidden px-4 py-3 border-t border-muted bg-background">
            <button
              onClick={() => handleViewLotDetails(selectedLot)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Ver lugares disponibles
            </button>
          </div>
        )}
      </aside>

      {/* Right side - Map */}
      <main className="flex-1 relative h-[50vh] lg:h-full">
        <ParkingMap
          lots={filteredLots}
          userLocation={userLocation}
          selectedLotId={selectedLot?.id || null}
          onSelectLot={handleSelectLot}
          center={mapCenter}
        />

        {/* Locate me button */}
        <button
          onClick={() => {
            if (userLocation) {
              window.dispatchEvent(new CustomEvent("center-map", { detail: userLocation }));
            }
          }}
          disabled={isLocating}
          className="absolute top-4 right-4 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
          aria-label="Mi ubicacion"
        >
          {isLocating ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          )}
        </button>

        {/* Selected lot panel (desktop) */}
        {selectedLot && (
          <div className="hidden lg:block absolute bottom-6 left-6 right-6 max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    selectedLot.availableSlots > 0 ? "bg-green-600" : "bg-gray-400"
                  }`}
                >
                  {selectedLot.name.split(/[\s-]+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{selectedLot.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{selectedLot.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-primary font-bold">${selectedLot.pricePerHour}/hr</span>
                    <span className="text-green-600">{selectedLot.availableSlots} disponibles</span>
                    <span className="text-muted-foreground">{selectedLot.distanceMeters}m</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleViewLotDetails(selectedLot)}
                className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Ver lugares disponibles
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs hidden lg:block">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-5 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center font-medium">$</span>
              Alta
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-medium">$</span>
              Media
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">$</span>
              Baja
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
