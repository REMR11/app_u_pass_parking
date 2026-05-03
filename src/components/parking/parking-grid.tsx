"use client";

import { useState } from "react";
import type { ParkingSlot, ParkingLevel, SlotCategory, SlotStatus } from "@/domain/parking/types";
import { InteractiveFloorPlan } from "./interactive-floor-plan";

interface ParkingGridProps {
  level: ParkingLevel;
  slots: ParkingSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
}

// ── Config maps ──────────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<SlotCategory, { badge: string | null; badgeClass: string }> = {
  accessible: {
    badge: "Discapacidad",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  elderly: {
    badge: "Adulto mayor",
    badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  standard: {
    badge: null,
    badgeClass: "",
  },
};

const STATUS_CONFIG: Record<SlotStatus | "selected", {
  bg: string; border: string; text: string; dot: string; label: string; interactive: boolean;
}> = {
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
};

// ── Filter type ──────────────────────────────────────────────────────────────
type SlotFilter = "all" | "available" | "accessible" | "elderly";

const FILTERS: { id: SlotFilter; label: string; icon: string }[] = [
  { id: "all",        label: "Todos",        icon: "grid" },
  { id: "available",  label: "Libres",       icon: "check" },
  { id: "accessible", label: "Discapacidad", icon: "accessible" },
  { id: "elderly",    label: "Adulto mayor", icon: "elderly" },
];

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
  const effectiveStatus: SlotStatus | "selected" = isSelected ? "selected" : slot.status;
  const cfg = STATUS_CONFIG[effectiveStatus];
  const catCfg = CATEGORY_CONFIG[slot.category];
  const isInteractive = slot.status === "available";

  return (
    <button
      onClick={isInteractive ? onSelect : undefined}
      disabled={!isInteractive}
      aria-label={`Espacio ${slot.code} — ${cfg.label}`}
      className={`
        relative flex items-center gap-3 w-full px-4 py-3.5
        rounded-2xl border-2 transition-all duration-150 text-left
        ${cfg.bg} ${cfg.border}
        ${isSelected ? "shadow-md ring-2 ring-accent/30" : ""}
        ${isInteractive ? "active:scale-[0.97] cursor-pointer" : "cursor-default opacity-60"}
      `}
    >
      {/* Status dot */}
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />

      {/* Slot code */}
      <span className={`text-base font-bold w-10 flex-shrink-0 font-mono ${isSelected ? "text-accent" : cfg.text}`}>
        {slot.code}
      </span>

      {/* Category badge + proximity */}
      <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
        {catCfg.badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catCfg.badgeClass}`}>
            {catCfg.badge}
          </span>
        )}
        {slot.entranceProximity <= 3 && slot.status === "available" && (
          <span className="text-[11px] font-medium text-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
            Cerca de acceso
          </span>
        )}
      </div>

      {/* Arrow — available slots only */}
      {isInteractive && (
        <svg
          className={`w-5 h-5 flex-shrink-0 ${isSelected ? "text-accent" : "text-muted-foreground"}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  );
}

// ── Aisle group (collapsible) ────────────────────────────────────────────────
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
  const [collapsed, setCollapsed] = useState(false);
  const available = slots.filter((s) => s.status === "available").length;
  const total = slots.length;

  // Auto-expand if the selected slot is in this aisle
  const hasSelected = slots.some((s) => s.id === selectedSlotId);
  const isOpen = hasSelected ? true : !collapsed;

  return (
    <div className="bg-background rounded-2xl border border-muted overflow-hidden shadow-sm">
      {/* Aisle header — tappable to collapse */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3.5 active:bg-muted/40 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{aisleName}</span>
          </div>
          <span className="font-semibold text-sm text-foreground">Pasillo {aisleName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            available > 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
          }`}>
            {available}/{total} libres
          </span>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Slots list — animated collapse */}
      {isOpen && (
        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-muted/60 pt-3">
          {slots.map((slot) => (
            <SlotRow
              key={slot.id}
              slot={slot}
              isSelected={slot.id === selectedSlotId}
              onSelect={() => onSelectSlot(slot)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Filter bar ───────────────────────────────────────────────────────────────
function FilterBar({
  active,
  onChange,
  counts,
}: {
  active: SlotFilter;
  onChange: (f: SlotFilter) => void;
  counts: Record<SlotFilter, number>;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {FILTERS.map((f) => {
        const isActive = f.id === active;
        const count = counts[f.id];

        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            aria-pressed={isActive}
            className={`
              flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full
              border-2 text-sm font-semibold transition-all duration-150 active:scale-[0.96]
              ${isActive
                ? "bg-primary border-primary text-primary-foreground shadow-sm"
                : "bg-background border-muted text-muted-foreground hover:border-primary/30"
              }
            `}
          >
            {f.id === "accessible" && (
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-1 7h2l2 4 2-1v2l-2.5 1L16 20h-2l-1-4-1 4H10l1.5-5L9 14v-2l2 1 1-4z"/>
              </svg>
            )}
            {f.id === "elderly" && (
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="2" />
                <path d="M9 10h6l-1 5-2 1v4h-2v-4L8 15l1-5z"/>
                <path d="M7 20c0-1.5 1-2 2-2" strokeLinecap="round"/>
              </svg>
            )}
            <span>{f.label}</span>
            {count > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-none ${
                isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
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
  const [activeFilter, setActiveFilter] = useState<SlotFilter>("all");

  // Counts for filter badges
  const counts: Record<SlotFilter, number> = {
    all:        slots.length,
    available:  slots.filter((s) => s.status === "available").length,
    accessible: slots.filter((s) => s.category === "accessible" && s.status === "available").length,
    elderly:    slots.filter((s) => s.category === "elderly"    && s.status === "available").length,
  };

  // Filter slots based on active filter
  const filteredSlots = slots.filter((s) => {
    if (activeFilter === "available")  return s.status === "available";
    if (activeFilter === "accessible") return s.category === "accessible";
    if (activeFilter === "elderly")    return s.category === "elderly";
    return true;
  });

  // Group filtered slots by row (aisle)
  const aisleLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const aisleMap = filteredSlots.reduce<Record<number, ParkingSlot[]>>((acc, slot) => {
    if (!acc[slot.row]) acc[slot.row] = [];
    acc[slot.row].push(slot);
    return acc;
  }, {});
  const aisleEntries = Object.entries(aisleMap).sort(([a], [b]) => Number(a) - Number(b));

  // Original row order for letter assignment (consistent regardless of filter)
  const allRows = [...new Set(slots.map((s) => s.row))].sort((a, b) => a - b);

  return (
    <div>
      {/* ── Interactive floor plan with zoom/fullscreen ────────────────────── */}
      <div className="bg-background rounded-2xl border border-muted p-3 mb-4 shadow-sm">
        <InteractiveFloorPlan
          level={level}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
        />
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <FilterBar active={activeFilter} onChange={setActiveFilter} counts={counts} />
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {aisleEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 9l6 6M15 9l-6 6" />
            </svg>
          </div>
          <p className="font-semibold text-foreground">Sin espacios disponibles</p>
          <p className="text-sm text-muted-foreground mt-1">
            No hay espacios para el filtro seleccionado en este nivel.
          </p>
        </div>
      )}

      {/* ── Aisle groups ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {aisleEntries.map(([rowNum, rowSlots]) => {
          const letterIndex = allRows.indexOf(Number(rowNum));
          return (
            <AisleGroup
              key={rowNum}
              aisleName={aisleLetters[letterIndex] ?? String(letterIndex + 1)}
              slots={rowSlots}
              selectedSlotId={selectedSlotId}
              onSelectSlot={onSelectSlot}
            />
          );
        })}
      </div>
    </div>
  );
}
