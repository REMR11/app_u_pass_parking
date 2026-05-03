"use client";

import type { ParkingSlot, ParkingLevel } from "@/domain/parking/types";

interface ParkingGridProps {
  level: ParkingLevel;
  slots: ParkingSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
}

// Status-driven colours -------------------------------------------------------
const STATUS_CONFIG = {
  available: {
    bg: "bg-muted/60",
    border: "border-muted-foreground/20",
    text: "text-foreground",
    dot: "bg-success",
    label: "Libre",
    interactive: true,
  },
  occupied: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    text: "text-primary/60",
    dot: "bg-primary",
    label: "Ocupado",
    interactive: false,
  },
  reserved: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    dot: "bg-warning",
    label: "Reservado",
    interactive: false,
  },
  selected: {
    bg: "bg-accent/10",
    border: "border-accent",
    text: "text-accent",
    dot: "bg-accent",
    label: "Seleccionado",
    interactive: true,
  },
} as const;

// Single slot button ----------------------------------------------------------
function SlotButton({
  slot,
  isSelected,
  onSelect,
}: {
  slot: ParkingSlot;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const effectiveStatus = isSelected ? "selected" : slot.status;
  const cfg = STATUS_CONFIG[effectiveStatus];
  const isInteractive = slot.status === "available" || isSelected;

  return (
    <button
      onClick={isInteractive ? onSelect : undefined}
      disabled={!isInteractive}
      aria-label={`Espacio ${slot.code} — ${cfg.label}`}
      className={`
        relative flex items-center gap-3 w-full px-4 py-3.5
        rounded-2xl border-2 transition-all duration-150 text-left
        ${cfg.bg} ${cfg.border}
        ${isSelected ? "shadow-md scale-[1.02]" : ""}
        ${isInteractive ? "active:scale-[0.97] cursor-pointer" : "cursor-default opacity-70"}
      `}
    >
      {/* Slot number — large, easy to read at a glance */}
      <span className={`text-xl font-bold w-14 text-center flex-shrink-0 ${cfg.text}`}>
        {slot.code}
      </span>

      {/* Status indicator */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</span>
      </div>

      {/* Arrow only for available/selected */}
      {isInteractive && (
        <svg
          className={`w-5 h-5 flex-shrink-0 ${isSelected ? "text-accent" : "text-muted-foreground"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  );
}

// Aisle group ----------------------------------------------------------------
function AisleGroup({
  aisleName,
  slots,
  selectedSlotId,
  onSelectSlot,
}: {
  aisleName: string;
  slots: ParkingSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
}) {
  const available = slots.filter((s) => s.status === "available").length;
  const total = slots.length;

  return (
    <div>
      {/* Aisle header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <span className="font-semibold text-sm text-foreground">
            Pasillo {aisleName}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            available > 0
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {available}/{total} libres
        </span>
      </div>

      {/* Slot list */}
      <div className="flex flex-col gap-2.5">
        {slots.map((slot) => (
          <SlotButton
            key={slot.id}
            slot={slot}
            isSelected={slot.id === selectedSlotId}
            onSelect={() => onSelectSlot(slot)}
          />
        ))}
      </div>
    </div>
  );
}

// Main exported component ----------------------------------------------------
export function ParkingGrid({
  level,
  slots,
  selectedSlotId,
  onSelectSlot,
}: ParkingGridProps) {
  // Group slots by row — each row represents an aisle
  const aisleMap = slots.reduce<Record<number, ParkingSlot[]>>((acc, slot) => {
    if (!acc[slot.row]) acc[slot.row] = [];
    acc[slot.row].push(slot);
    return acc;
  }, {});

  const aisleLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const aisleEntries = Object.entries(aisleMap).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  const totalAvailable = slots.filter((s) => s.status === "available").length;

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground text-base">
            {totalAvailable}
          </span>{" "}
          {totalAvailable === 1 ? "espacio libre" : "espacios libres"}
        </p>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            Libre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Ocupado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Tu selección
          </span>
        </div>
      </div>

      {/* Aisles */}
      <div className="flex flex-col gap-6">
        {aisleEntries.map(([rowNum, rowSlots], i) => (
          <AisleGroup
            key={rowNum}
            aisleName={aisleLetters[i] ?? rowNum}
            slots={rowSlots}
            selectedSlotId={selectedSlotId}
            onSelectSlot={onSelectSlot}
          />
        ))}
      </div>
    </div>
  );
}
