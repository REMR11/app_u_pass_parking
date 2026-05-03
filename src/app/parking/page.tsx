"use client";

import { useState, useMemo, useEffect } from "react";
import { ParkingGrid } from "@/components/parking/parking-grid";
import { SlotDetailsSheet } from "@/components/parking/slot-details-sheet";
import { ParkingMap, type FilterMode } from "@/components/parking/parking-map";
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

type ViewMode = "map" | "slots";

export default function ParkingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [activeFilter, setActiveFilter] = useState<FilterType>("recommended");
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLotSheet, setShowLotSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Get filtered parking lots
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
    if (isMobile) {
      setShowLotSheet(true);
    }
  };

  // Handle viewing lot details (slots)
  const handleViewLotDetails = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setSelectedLevelId(lot.levels[0]?.id || null);
    setViewMode("slots");
    setSelectedSlot(null);
    setShowLotSheet(false);
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

  // Convert filter type to map filter mode
  const getMapFilterMode = (): FilterMode => {
    switch (activeFilter) {
      case "nearest": return "nearby";
      case "cheapest": return "cheapest";
      default: return "recommended";
    }
  };

  // Best lot (first in recommended list)
  const bestLot = filteredLots[0];

  // Count available
  const availableCount = filteredLots.filter((l) => l.availableSlots > 0).length;

  // Center map on best lot when filter changes
  useEffect(() => {
    if (bestLot && viewMode === "map") {
      // Select the best lot and center map on it
      setSelectedLot(bestLot);
      setShowLotSheet(false); // Don't show sheet automatically, just highlight
      
      // Dispatch event to center map on best lot
      window.dispatchEvent(
        new CustomEvent("center-map", { detail: bestLot.coordinates })
      );
    }
  }, [activeFilter]); // Only trigger when filter changes

  // ==========================================
  // MOBILE: Slots View
  // ==========================================
  if (viewMode === "slots" && selectedLot && isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Compact header */}
        <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 safe-area-top">
          <button
            onClick={handleBackToMap}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors"
            aria-label="Volver"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">{selectedLot.name}</h1>
            <p className="text-sm text-white/80">{selectedLot.availableSlots} lugares libres</p>
          </div>
        </header>

        {/* Level tabs - large touch targets */}
        <div className="px-4 py-3 bg-muted/50">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {selectedLot.levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevelId(level.id)}
                className={`flex-shrink-0 px-5 py-3 rounded-xl font-semibold text-base transition-colors ${
                  selectedLevelId === level.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-foreground border border-muted"
                }`}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>

        {/* Parking grid */}
        {currentLevel && (
          <div className="flex-1 px-4 py-4 overflow-auto">
            <p className="text-sm text-muted-foreground mb-3">{currentLevel.aisle}</p>
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

  // ==========================================
  // MOBILE: Map View (Driver-First Design)
  // ==========================================
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Full-screen map */}
        <div className="flex-1 relative">
          <ParkingMap
            lots={filteredLots}
            userLocation={userLocation}
            selectedLotId={selectedLot?.id || null}
            onSelectLot={handleSelectLot}
            center={mapCenter}
            filterMode={getMapFilterMode()}
          />

          {/* Top bar - minimal info */}
          <div className="absolute top-4 left-4 right-4 flex items-center gap-3 z-[1000]">
            {/* Logo pill */}
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <span className="font-bold text-lg">U</span>
              <span className="font-semibold">U-Pass</span>
            </div>
            
            {/* Quick stats */}
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-semibold text-foreground">{availableCount}</span>
              <span className="text-muted-foreground">disponibles</span>
            </div>
          </div>

          {/* My location button - large and accessible */}
          <button
            onClick={() => {
              if (userLocation) {
                window.dispatchEvent(new CustomEvent("center-map", { detail: userLocation }));
              }
            }}
            disabled={isLocating}
            className="absolute top-20 right-4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-gray-100 transition-colors disabled:opacity-50 z-[1000]"
            aria-label="Mi ubicacion"
          >
            {isLocating ? (
              <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
            )}
          </button>

          {/* Filter pills - horizontal scroll */}
          <div className="absolute bottom-32 left-0 right-0 px-4 z-[1000]">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {[
                { key: "recommended" as FilterType, label: "Recomendados", icon: "star" },
                { key: "nearest" as FilterType, label: "Cercanos", icon: "location" },
                { key: "cheapest" as FilterType, label: "Economicos", icon: "price" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex-shrink-0 px-5 py-3 rounded-full font-medium text-base shadow-lg transition-all ${
                    activeFilter === filter.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom action card - quick access to best option */}
        {bestLot && !showLotSheet && (
          <div className="bg-white border-t border-muted px-4 py-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[1000] relative">
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Mejor opcion</p>
                <h3 className="font-bold text-foreground text-lg truncate">{bestLot.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="text-success font-semibold">{bestLot.availableSlots} libres</span>
                  <span className="text-muted-foreground">{bestLot.distanceMeters}m</span>
                  <span className="text-primary font-bold">${bestLot.pricePerHour.toFixed(2)}/hr</span>
                </div>
              </div>
              <button
                onClick={() => handleViewLotDetails(bestLot)}
                className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                aria-label="Ir a estacionamiento"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Selected lot sheet */}
        {showLotSheet && selectedLot && (
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom pb-safe z-[1001]">
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>
            
            {/* Content */}
            <div className="px-5 pb-5">
              {/* Close button */}
              <button
                onClick={() => setShowLotSheet(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Lot info */}
              <div className="flex items-start gap-4 mb-5">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${
                    selectedLot.availableSlots > 10 ? "bg-success" : selectedLot.availableSlots > 0 ? "bg-warning" : "bg-destructive"
                  }`}
                >
                  {selectedLot.availableSlots}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-xl text-foreground">{selectedLot.name}</h2>
                  <p className="text-muted-foreground mt-1">{selectedLot.address}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedLot.distanceMeters}m</p>
                  <p className="text-xs text-muted-foreground">Distancia</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary">${selectedLot.pricePerHour.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Por hora</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedLot.rating}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={() => handleViewLotDetails(selectedLot)}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform"
              >
                Ver lugares disponibles
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // DESKTOP: Split View
  // ==========================================
  if (viewMode === "slots" && selectedLot) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="bg-primary text-primary-foreground px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToMap}
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
        <div className="px-6 py-4 border-b border-muted">
          <LevelSelector
            levels={selectedLot.levels}
            selectedLevelId={selectedLevelId || ""}
            onSelectLevel={setSelectedLevelId}
          />
        </div>

        {/* Parking grid */}
        {currentLevel && (
          <div className="flex-1 px-6 py-4 overflow-auto">
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
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Left sidebar - List */}
      <aside className="w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col border-r border-muted bg-background z-10">
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
          Mostrando <span className="font-semibold text-foreground">{availableCount}</span> estacionamientos disponibles
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
      </aside>

      {/* Right side - Map */}
      <main className="flex-1 relative">
        <ParkingMap
          lots={filteredLots}
          userLocation={userLocation}
          selectedLotId={selectedLot?.id || null}
          onSelectLot={handleSelectLot}
          center={mapCenter}
          filterMode={getMapFilterMode()}
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

        {/* Selected lot panel */}
        {selectedLot && (
          <div className="absolute bottom-6 left-6 right-6 max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    selectedLot.availableSlots > 0 ? "bg-success" : "bg-muted-foreground"
                  }`}
                >
                  {selectedLot.name.split(/[\s-]+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{selectedLot.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{selectedLot.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-primary font-bold">${selectedLot.pricePerHour.toFixed(2)}/hr</span>
                    <span className="text-success">{selectedLot.availableSlots} disponibles</span>
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

        {/* Legend - context-aware based on filter */}
        <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs">
          <p className="text-muted-foreground mb-1.5 font-medium">
            {activeFilter === "nearest" ? "Por cercania" : activeFilter === "cheapest" ? "Por precio" : "Por disponibilidad"}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-5 rounded-full bg-success text-white text-[10px] flex items-center justify-center font-medium">$</span>
              Mejor
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-5 rounded-full bg-[#84cc16] text-white text-[10px] flex items-center justify-center font-medium">$</span>
              Bueno
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-5 rounded-full bg-warning text-white text-[10px] flex items-center justify-center font-medium">$</span>
              Regular
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
