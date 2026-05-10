"use client";

import { ParkingGrid } from "@/components/parking/parking-grid";
import { SlotDetailsSheet } from "@/components/parking/slot-details-sheet";
import { LevelSelector } from "@/components/parking/level-selector";
import type { ParkingSlot, ParkingLot, ParkingLevel } from "@/domain/parking/types";

export type ParkingSlotsViewProps = {
  variant: "mobile" | "desktop";
  selectedLot: ParkingLot;
  currentLevel: ParkingLevel | null;
  selectedLevelId: string | null;
  onSelectLevel: (id: string) => void;
  selectedSlot: ParkingSlot | null;
  onSelectSlot: (slot: ParkingSlot) => void;
  onBackToMap: () => void;
  onReserve: () => void;
  onCloseSlot: () => void;
};

export function ParkingSlotsView({
  variant,
  selectedLot,
  currentLevel,
  selectedLevelId,
  onSelectLevel,
  selectedSlot,
  onSelectSlot,
  onBackToMap,
  onReserve,
  onCloseSlot,
}: ParkingSlotsViewProps) {
  const availableInLevel = currentLevel
    ? currentLevel.slots.filter((s) => s.status === "available").length
    : 0;

  const rootClass =
    variant === "mobile"
      ? "h-dvh bg-background flex flex-col overflow-hidden"
      : "h-screen bg-muted/30 flex flex-col overflow-hidden";

  if (variant === "mobile") {
    return (
      <div className={rootClass}>
        <header className="bg-primary text-primary-foreground px-4 pt-safe flex-shrink-0">
          <div className="flex items-center gap-3 py-3">
            <button
              type="button"
              onClick={onBackToMap}
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
            <div className="flex-shrink-0 bg-success rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-white text-sm font-bold">{availableInLevel}</span>
            </div>
          </div>
        </header>

        <div className="bg-foreground px-4 py-3 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {selectedLot.levels.map((level) => {
              const lvlAvailable = level.slots.filter((s) => s.status === "available").length;
              const isActive = selectedLevelId === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => onSelectLevel(level.id)}
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

        {currentLevel ? (
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-4 py-4 pb-40">
              <ParkingGrid
                level={currentLevel}
                slots={currentLevel.slots}
                selectedSlotId={selectedSlot?.id ?? null}
                onSelectSlot={onSelectSlot}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Selecciona un nivel</div>
        )}

        <SlotDetailsSheet
          slot={selectedSlot}
          level={currentLevel}
          lot={selectedLot}
          onReserve={onReserve}
          onClose={onCloseSlot}
        />
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <header className="bg-primary text-primary-foreground px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToMap}
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
          <div className="ml-auto flex-shrink-0 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold">
            {availableInLevel} libres
          </div>
        </div>
      </header>

      <div className="bg-background border-b border-muted px-4 py-3 flex-shrink-0">
        <LevelSelector
          levels={selectedLot.levels}
          selectedLevelId={selectedLevelId ?? ""}
          onSelectLevel={onSelectLevel}
        />
      </div>

      {currentLevel ? (
        <div className="flex-1 overflow-y-auto px-4 py-5 pb-32">
          <ParkingGrid
            level={currentLevel}
            slots={currentLevel.slots}
            selectedSlotId={selectedSlot?.id ?? null}
            onSelectSlot={onSelectSlot}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Selecciona un nivel</div>
      )}

      <SlotDetailsSheet
        slot={selectedSlot}
        level={currentLevel}
        lot={selectedLot}
        onReserve={onReserve}
        onClose={onCloseSlot}
      />
    </div>
  );
}
