"use client";

import { ParkingMap, type ParkingMapHandle } from "@/components/parking/parking-map";
import { ParkingListCard } from "@/components/parking/parking-list-card";
import { FilterTabs, type FilterType } from "@/components/parking/filter-tabs";
import type { ParkingLot, Coordinates } from "@/domain/parking/types";
import type { ParkingMapFilterMode } from "@/lib/parking/map-filter-mode";
import type { RefObject } from "react";

export type DesktopParkingViewProps = {
  mapRef: RefObject<ParkingMapHandle | null>;
  tenantShortName: string;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  activeFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  availableCount: number;
  filteredLots: ParkingLot[];
  selectedLot: ParkingLot | null;
  onSelectLot: (lot: ParkingLot) => void;
  userLocation: Coordinates | null;
  mapCenter: Coordinates;
  filterMode: ParkingMapFilterMode;
  isLocating: boolean;
  onCenterOnUser: () => void;
  onViewLotDetails: (lot: ParkingLot) => void;
};

export function DesktopParkingView({
  mapRef,
  tenantShortName,
  searchQuery,
  onSearchQueryChange,
  activeFilter,
  onFilterChange,
  availableCount,
  filteredLots,
  selectedLot,
  onSelectLot,
  userLocation,
  mapCenter,
  filterMode,
  isLocating,
  onCenterOnUser,
  onViewLotDetails,
}: DesktopParkingViewProps) {
  const initial = tenantShortName.trim().charAt(0).toUpperCase() || "P";

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <aside className="w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col border-r border-muted bg-background z-10">
        <header className="px-4 py-4 border-b border-muted">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">{initial}</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">{tenantShortName}</h1>
              <p className="text-xs text-muted-foreground">Estacionamientos disponibles</p>
            </div>
          </div>

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
              type="search"
              placeholder="Buscar por nombre, direccion..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-muted bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </header>

        <div className="px-4 py-3 border-b border-muted">
          <FilterTabs activeFilter={activeFilter} onFilterChange={onFilterChange} />
        </div>

        <div className="px-4 py-2 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{availableCount}</span> estacionamientos disponibles
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 scrollbar-hide">
          {filteredLots.map((lot) => (
            <ParkingListCard
              key={lot.id}
              lot={lot}
              isSelected={selectedLot?.id === lot.id}
              onSelect={onSelectLot}
            />
          ))}

          {filteredLots.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron estacionamientos</p>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 relative">
        <ParkingMap
          ref={mapRef}
          lots={filteredLots}
          userLocation={userLocation}
          selectedLotId={selectedLot?.id ?? null}
          onSelectLot={onSelectLot}
          center={mapCenter}
          filterMode={filterMode}
        />

        <button
          type="button"
          onClick={onCenterOnUser}
          disabled={isLocating || !userLocation}
          className="absolute top-4 right-4 w-11 h-11 bg-background rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
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

        {selectedLot && (
          <div className="absolute bottom-6 left-6 right-6 max-w-md">
            <div className="bg-background rounded-2xl shadow-xl p-4 border border-muted">
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    selectedLot.availableSlots > 0 ? "bg-success" : "bg-muted-foreground"
                  }`}
                >
                  {selectedLot.name
                    .split(/[\s-]+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
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
                type="button"
                onClick={() => onViewLotDetails(selectedLot)}
                className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Ver lugares disponibles
              </button>
            </div>
          </div>
        )}

        <div className="absolute bottom-6 right-6 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs border border-muted">
          <p className="text-muted-foreground mb-1.5 font-medium">
            {activeFilter === "nearest"
              ? "Por cercania"
              : activeFilter === "cheapest"
                ? "Por precio"
                : "Por disponibilidad"}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-5 rounded-full bg-success text-white text-[10px] flex items-center justify-center font-medium">
                $
              </span>
              Mejor
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-6 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-medium"
                style={{ backgroundColor: "var(--map-marker-tier-lime)" }}
              >
                $
              </span>
              Bueno
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-5 rounded-full bg-warning text-white text-[10px] flex items-center justify-center font-medium">
                $
              </span>
              Regular
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
