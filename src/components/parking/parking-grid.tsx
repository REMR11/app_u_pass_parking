"use client";

import type { ParkingSlot, ParkingLevel } from "@/domain/parking/types";
import { FloorPlanMap } from "./floor-plan-map";

interface ParkingGridProps {
  level: ParkingLevel;
  slots: ParkingSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
}

// Category config for the list view
const CATEGORY_CONFIG = {
  accessible: {
    badge: "♿ Discapacidad",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  elderly: {
    badge: "🧓 A. Mayor",
    badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  standard: {
    badge: null,
    badgeClass: "",
  },
} as const;

const STATUS_CONFIG = {
  available: {
    bg: "bg-background",
    border: "border-muted-foreground/20",
    text: "text-foreground",
    dot: "bg-success",
    label: "Libre",
    interactive: true,
  },
  occupied: {
    bg: "bg-muted/40",
    border: "border-muted/60",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/40",
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

// ── Single slot row ──────────────────────────────────────────────────────────
function SlotRow({
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
  const catCfg = CATEGORY_CONFIG[slot.category];
  const isInteractive = slot.status === "available";

  return (
    <button
      onClick={isInteractive ? onSelect : undefined}
      disabled={!isInteractive}
      aria-label={`Espacio ${slot.code} — ${cfg.label}`}
      className={`
        relative flex items-center gap-3 w-full px-4 py-3
        rounded-2xl border-2 transition-all duration-150 text-left
        ${cfg.bg} ${cfg.border}
        ${isSelected ? "shadow-md ring-2 ring-accent/30" : ""}
        ${isInteractive ? "active:scale-[0.97] cursor-pointer" : "cursor-default"}
      `}
    >
      {/* Slot code — large for at-a-glance reading */}
      <span
        className={`text-lg font-bold w-12 text-center flex-shrink-0 font-mono ${
          isSelected ? "text-accent" : cfg.text
        }`}
      >
        {slot.code}
      </span>

      {/* Status + category badges */}
      <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
        <span className={`flex items-center gap-1.5 text-sm font-medium ${cfg.text}`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
          {cfg.label}
        </span>
        {catCfg.badge && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catCfg.badgeClass}`}
          >
            {catCfg.badge}
          </span>
        )}
        {/* Proximity indicator */}
        {slot.entranceProximity <= 3 && slot.status === "available" && (
          <span className="text-[11px] font-medium text-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
            Cerca de acceso
          </span>
        )}
      </div>

      {/* Arrow for available slots only */}
      {isInteractive && (
        <svg
          className={`w-5 h-5 flex-shrink-0 ${
            isSelected ? "text-accent" : "text-muted-foreground"
          }`}
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

// ── Aisle group ──────────────────────────────────────────────────────────────
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
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <span className="font-semibold text-sm text-foreground">
            Pasillo {aisleName}
          </span>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            available > 0
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {available}/{total} libres
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {slots.map((slot) => (
          <SlotRow
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

// ── Main exported component ──────────────────────────────────────────────────
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
  const accessibleAvailable = slots.filter(
    (s) => s.category === "accessible" && s.status === "available"
  ).length;
  const elderlyAvailable = slots.filter(
    (s) => s.category === "elderly" && s.status === "available"
  ).length;

  return (
    <div>
      {/* ── Floor plan mini-map ─────────────────────────────────────────── */}
      <div className="bg-background rounded-2xl border border-muted p-4 mb-5 shadow-sm">
        <FloorPlanMap
          level={level}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
        />
      </div>

      {/* ── Availability summary chips ──────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-5">
        <div className="flex items-center gap-1.5 bg-success/10 text-success text-sm font-semibold px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-success" />
          {totalAvailable} libres
        </div>
        {accessibleAvailable > 0 && (
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-blue-100">
            ♿ {accessibleAvailable} accesibles
          </div>
        )}
        {elderlyAvailable > 0 && (
          <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-yellow-100">
            🧓 {elderlyAvailable} adulto mayor
          </div>
        )}
      </div>

      {/* ── Aisle list ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">
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
