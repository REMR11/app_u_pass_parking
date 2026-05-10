"use client";

import { ParkingMap, type ParkingMapHandle } from "@/components/parking/parking-map";
import type { ParkingLot, Coordinates } from "@/domain/parking/types";
import type { ParkingMapFilterMode } from "@/lib/parking/map-filter-mode";
import type { FilterType } from "@/components/parking/filter-tabs";
import type { RefObject } from "react";

const MOBILE_FILTERS: { key: FilterType; label: string }[] = [
  { key: "recommended", label: "Recomendados" },
  { key: "nearest", label: "Cercanos" },
  { key: "cheapest", label: "Economicos" },
];

const BUTTONS_BOTTOM = 72;

export type MobileParkingMapViewProps = {
  mapRef: RefObject<ParkingMapHandle | null>;
  filteredLots: ParkingLot[];
  userLocation: Coordinates | null;
  selectedLot: ParkingLot | null;
  onSelectLot: (lot: ParkingLot) => void;
  mapCenter: Coordinates;
  filterMode: ParkingMapFilterMode;
  availableCount: number;
  tenantShortName: string;
  activeFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  showLotSheet: boolean;
  onShowLotSheet: (v: boolean) => void;
  bestLot: ParkingLot | undefined;
  onViewLotDetails: (lot: ParkingLot) => void;
  isLocating: boolean;
  onCenterOnUser: () => void;
};

export function MobileParkingMapView({
  mapRef,
  filteredLots,
  userLocation,
  selectedLot,
  onSelectLot,
  mapCenter,
  filterMode,
  availableCount,
  tenantShortName,
  activeFilter,
  onFilterChange,
  showLotSheet,
  onShowLotSheet,
  bestLot,
  onViewLotDetails,
  isLocating,
  onCenterOnUser,
}: MobileParkingMapViewProps) {
  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <div className="flex-1 relative overflow-hidden">
        <ParkingMap
          ref={mapRef}
          lots={filteredLots}
          userLocation={userLocation}
          selectedLotId={selectedLot?.id ?? null}
          onSelectLot={onSelectLot}
          center={mapCenter}
          filterMode={filterMode}
        />

        <div
          className="absolute top-0 left-0 right-0 pt-safe px-4 pb-3 z-[1000]"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
          }}
        >
          <div className="flex items-center gap-3 pt-3">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border border-white/20">
              <span className="font-black text-base tracking-tight">{tenantShortName}</span>
            </div>
            <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-success flex-shrink-0 animate-pulse" />
              <span className="font-bold text-sm">{availableCount}</span>
              <span className="text-white/70 text-sm">disponibles</span>
            </div>
          </div>
        </div>

        <div
          className="absolute right-4 z-[1000] flex flex-col gap-2"
          style={{ bottom: `${BUTTONS_BOTTOM + 56 + 12}px` }}
        >
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            className="w-14 h-14 bg-white rounded-full shadow-xl border-2 border-primary/20 flex items-center justify-center active:scale-95 transition-all"
            aria-label="Acercar"
          >
            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            className="w-14 h-14 bg-white rounded-full shadow-xl border-2 border-primary/20 flex items-center justify-center active:scale-95 transition-all"
            aria-label="Alejar"
          >
            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={onCenterOnUser}
          disabled={isLocating}
          className="absolute right-4 z-[1000] w-14 h-14 bg-white rounded-full shadow-xl border-2 border-primary/20 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
          style={{ bottom: `${BUTTONS_BOTTOM}px` }}
          aria-label="Mi ubicacion"
        >
          {isLocating ? (
            <div className="w-6 h-6 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex-shrink-0 px-3 py-2 z-[1000]">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {MOBILE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterChange(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                activeFilter === f.key
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/40"
                  : "bg-foreground text-background shadow-sm shadow-black/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {(showLotSheet && selectedLot) || (bestLot && !showLotSheet) ? (
        <div
          className={`relative flex-shrink-0 bg-white z-[1001] transition-all ${
            showLotSheet ? "rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.22)]" : "shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
          }`}
          style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
        >
          {showLotSheet && selectedLot && (
            <>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              <button
                type="button"
                onClick={() => onShowLotSheet(false)}
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
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex flex-col items-center justify-center flex-shrink-0 shadow-md">
                <span className="font-black text-xl text-primary-foreground leading-none">
                  {showLotSheet && selectedLot ? selectedLot.availableSlots : bestLot?.availableSlots}
                </span>
                <span className="text-[9px] font-bold text-primary-foreground/70 uppercase tracking-tight mt-0.5">libres</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-lg text-foreground leading-tight truncate">
                    {showLotSheet && selectedLot ? selectedLot.name : bestLot?.name}
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded leading-none ${
                      (showLotSheet ? selectedLot?.facilityType : bestLot?.facilityType) === "large"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {(showLotSheet ? selectedLot?.facilityType : bestLot?.facilityType) === "large" ? "GRANDE" : "LOCAL"}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm truncate mt-0.5">
                  {showLotSheet && selectedLot ? selectedLot.address : bestLot?.address}
                </p>
              </div>
            </div>

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

            <button
              type="button"
              onClick={() => {
                const lot = showLotSheet ? selectedLot : bestLot;
                if (lot) onViewLotDetails(lot);
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
