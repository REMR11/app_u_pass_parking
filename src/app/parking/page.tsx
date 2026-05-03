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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  // ==========================================
  // MOBILE: Slots View
  // ==========================================
  if (viewMode === "slots" && selectedLot && isMobile) {
    const availableInLevel = currentLevel
      ? currentLevel.slots.filter((s) => s.status === "available").length
      : 0;

    return (
      <div className="h-dvh bg-background flex flex-col overflow-hidden">
        {/* Header — full bleed, accounts for status bar */}
        <header className="bg-primary text-primary-foreground px-4 pt-safe flex-shrink-0">
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={handleBackToMap}
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors flex-shrink-0"
              aria-label="Volver"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-base leading-tight truncate">{selectedLot.name}</h1>
              <p className="text-sm text-white/80">{selectedLot.address}</p>
            </div>
            {/* Available pill — high contrast green on dark */}
            <div className="flex-shrink-0 bg-success rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-white text-sm font-bold">{availableInLevel}</span>
            </div>
          </div>
        </header>

        {/* Level tabs — large tap targets, high contrast active state */}
        <div className="bg-foreground px-4 py-3 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {selectedLot.levels.map((level) => {
              const lvlAvailable = level.slots.filter((s) => s.status === "available").length;
              const isActive = selectedLevelId === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevelId(level.id)}
                  className={`flex-shrink-0 flex flex-col items-center px-5 py-2.5 rounded-xl font-bold text-sm transition-all min-w-[72px] ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/40 scale-105"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  <span className="text-base font-black">{level.name}</span>
                  <span className={`text-xs mt-0.5 ${isActive ? "text-white/90" : "text-white/50"}`}>
                    {lvlAvailable} libres
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable grid */}
        {currentLevel ? (
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-4 py-4 pb-40">
              <ParkingGrid
                level={currentLevel}
                slots={currentLevel.slots}
                selectedSlotId={selectedSlot?.id || null}
                onSelectSlot={handleSelectSlot}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Selecciona un nivel
          </div>
        )}

        {/* Slot details — fixed bottom panel */}
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
    // Offset for floating buttons above the filter strip
    const BUTTONS_BOTTOM = 72; // height of filter strip + safe margin

    return (
      <div className="h-dvh flex flex-col bg-background overflow-hidden">
        {/* Map — fills all available space between top and bottom card */}
        <div className="flex-1 relative overflow-hidden">
          <ParkingMap
            lots={filteredLots}
            userLocation={userLocation}
            selectedLotId={selectedLot?.id || null}
            onSelectLot={handleSelectLot}
            center={mapCenter}
            filterMode={getMapFilterMode()}
          />

          {/* ── TOP BAR ── status-bar aware, high contrast */}
          <div className="absolute top-0 left-0 right-0 pt-safe px-4 pb-3 z-[1000]"
               style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)" }}>
            <div className="flex items-center gap-3 pt-3">
              {/* Brand */}
              <div className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border border-white/20">
                <span className="font-black text-base tracking-tight">U-Pass</span>
              </div>
              {/* Slots counter */}
              <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/10">
                <span className="w-2 h-2 rounded-full bg-success flex-shrink-0 animate-pulse" />
                <span className="font-bold text-sm">{availableCount}</span>
                <span className="text-white/70 text-sm">disponibles</span>
              </div>
            </div>
          </div>

          {/* ── ZOOM BUTTONS ── above location button, same round white/blue style */}
          <div
            className="absolute right-4 z-[1000] flex flex-col gap-2"
            style={{ bottom: `${BUTTONS_BOTTOM + 56 + 12}px` }}
          >
            <button
              onClick={() => window.dispatchEvent(new Event("map-zoom-in"))}
              className="w-14 h-14 bg-white rounded-full shadow-xl border-2 border-primary/20 flex items-center justify-center active:scale-95 transition-all"
              aria-label="Acercar"
            >
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button
              onClick={() => window.dispatchEvent(new Event("map-zoom-out"))}
              className="w-14 h-14 bg-white rounded-full shadow-xl border-2 border-primary/20 flex items-center justify-center active:scale-95 transition-all"
              aria-label="Alejar"
            >
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
              </svg>
            </button>
          </div>

          {/* ── LOCATION BUTTON ── below zoom buttons, same style */}
          <button
            onClick={() => {
              if (userLocation) {
                window.dispatchEvent(new CustomEvent("center-map", { detail: userLocation }));
              }
            }}
            disabled={isLocating}
            className="absolute right-4 z-[1000] w-14 h-14 bg-white rounded-full shadow-xl border-2 border-primary/20 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
            style={{ bottom: `${BUTTONS_BOTTOM}px` }}
            aria-label="Mi ubicacion"
          >
            {isLocating ? (
              <div className="w-6 h-6 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
            )}
          </button>

        </div>

        {/* ── FILTER PILLS ── in flex flow, always above card */}
        <div className="flex-shrink-0 bg-foreground px-4 py-3 z-[1000]">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
            {(
              [
                { key: "recommended" as FilterType, label: "Recomendados" },
                { key: "nearest" as FilterType, label: "Cercanos" },
                { key: "cheapest" as FilterType, label: "Economicos" },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex-shrink-0 px-5 py-3 rounded-full font-black text-base transition-all ${
                  activeFilter === f.key
                    ? "bg-primary text-white"
                    : "bg-white/10 text-white border border-white/20"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── UNIFIED BOTTOM CARD ── white bg, consistent layout for both states */}
        {(showLotSheet && selectedLot) || (bestLot && !showLotSheet) ? (
          <div
            className={`flex-shrink-0 bg-white z-[1001] transition-all ${
              showLotSheet ? "rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.22)]" : "shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
            }`}
            style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
          >
            {/* Drag handle + close for selected state */}
            {showLotSheet && selectedLot && (
              <>
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                </div>
                <button
                  onClick={() => setShowLotSheet(false)}
                  className="absolute top-3 right-4 w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center z-10"
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}

            <div className="px-5 pt-4 pb-5">
              {/* Header row: availability badge + name + type */}
              <div className="flex items-center gap-4 mb-4">
                {/* Availability badge — primary blue, always */}
                <div className="w-14 h-14 rounded-2xl bg-primary flex flex-col items-center justify-center flex-shrink-0 shadow-md">
                  <span className="font-black text-xl text-white leading-none">
                    {showLotSheet && selectedLot ? selectedLot.availableSlots : bestLot?.availableSlots}
                  </span>
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-tight mt-0.5">libres</span>
                </div>

                {/* Name + address */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-black text-lg text-foreground leading-tight truncate">
                      {showLotSheet && selectedLot ? selectedLot.name : bestLot?.name}
                    </h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded leading-none ${
                      (showLotSheet ? selectedLot?.facilityType : bestLot?.facilityType) === "large"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {(showLotSheet ? selectedLot?.facilityType : bestLot?.facilityType) === "large" ? "GRANDE" : "LOCAL"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm truncate mt-0.5">
                    {showLotSheet && selectedLot ? selectedLot.address : bestLot?.address}
                  </p>
                </div>
              </div>

              {/* Stats row — 3 columns, consistent */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-muted rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-foreground leading-tight">
                    {(() => {
                      const lot = showLotSheet ? selectedLot : bestLot;
                      if (!lot) return "-";
                      return lot.distanceMeters >= 1000
                        ? `${(lot.distanceMeters / 1000).toFixed(1)}km`
                        : `${lot.distanceMeters}m`;
                    })()}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Distancia</p>
                </div>
                <div className="bg-success/10 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-success leading-tight">
                    ${(showLotSheet ? selectedLot?.pricePerHour : bestLot?.pricePerHour)?.toFixed(2) || "-"}
                  </p>
                  <p className="text-[10px] text-success/70 font-medium uppercase tracking-wide">Por hora</p>
                </div>
                <div className="bg-muted rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-foreground leading-tight">
                    {(showLotSheet ? selectedLot?.rating : bestLot?.rating) || "-"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Rating</p>
                </div>
              </div>

              {/* CTA button — full width, high contrast green */}
              <button
                onClick={() => {
                  const lot = showLotSheet ? selectedLot : bestLot;
                  if (lot) handleViewLotDetails(lot);
                }}
                className="w-full py-4 bg-success text-white rounded-2xl font-black text-base active:scale-[0.98] transition-transform shadow-lg shadow-success/30"
              >
                Ver lugares disponibles
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // ==========================================
  // SLOT SELECTION VIEW (mobile + desktop)
  // ==========================================
  if (viewMode === "slots" && selectedLot) {
    const availableInLevel = currentLevel
      ? currentLevel.slots.filter((s) => s.status === "available").length
      : 0;

    return (
      <div className="h-screen bg-muted/30 flex flex-col overflow-hidden">
        {/* Header — compact, branded */}
        <header className="bg-primary text-primary-foreground px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToMap}
              className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center active:bg-white/25 transition-colors flex-shrink-0"
              aria-label="Volver al mapa"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-base leading-tight truncate">{selectedLot.name}</h1>
              <p className="text-xs text-white/70 truncate">{selectedLot.address}</p>
            </div>
            {/* Available count chip */}
            <div className="ml-auto flex-shrink-0 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold">
              {availableInLevel} libres
            </div>
          </div>
        </header>

        {/* Level tabs — horizontal scroll, always visible */}
        <div className="bg-background border-b border-muted px-4 py-3 flex-shrink-0">
          <LevelSelector
            levels={selectedLot.levels}
            selectedLevelId={selectedLevelId || ""}
            onSelectLevel={setSelectedLevelId}
          />
        </div>

        {/* Scrollable slot list */}
        {currentLevel ? (
          <div className="flex-1 overflow-y-auto px-4 py-5 pb-32">
            <ParkingGrid
              level={currentLevel}
              slots={currentLevel.slots}
              selectedSlotId={selectedSlot?.id || null}
              onSelectSlot={handleSelectSlot}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Selecciona un nivel
          </div>
        )}

        {/* Slot details sheet — slides up over content */}
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
          {filteredLots.map((lot) => (
            <ParkingListCard
              key={lot.id}
              lot={lot}
              isSelected={selectedLot?.id === lot.id}
              onSelect={handleSelectLot}
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
