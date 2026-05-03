"use client";

import type { ParkingSlot, SlotStatus } from "@/domain/parking/types";

interface ParkingGridProps {
  slots: ParkingSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
}

function CarIcon({ status, isSelected }: { status: SlotStatus; isSelected: boolean }) {
  const getColor = () => {
    if (isSelected) return "#F97316"; // orange for selected
    if (status === "available") return "#9CA3AF"; // gray for available
    return "#2563EB"; // blue for occupied
  };

  return (
    <svg viewBox="0 0 40 70" className="w-full h-full drop-shadow-sm">
      {/* Car body */}
      <rect
        x="4"
        y="10"
        width="32"
        height="50"
        rx="8"
        fill={getColor()}
      />
      {/* Roof/cabin */}
      <rect
        x="8"
        y="20"
        width="24"
        height="20"
        rx="4"
        fill={status === "available" ? "#6B7280" : isSelected ? "#EA580C" : "#1D4ED8"}
      />
      {/* Windshield */}
      <rect
        x="10"
        y="22"
        width="20"
        height="8"
        rx="2"
        fill={status === "available" ? "#4B5563" : isSelected ? "#C2410C" : "#1E40AF"}
      />
      {/* Headlights */}
      <rect x="8" y="12" width="6" height="4" rx="1" fill="#E5E7EB" />
      <rect x="26" y="12" width="6" height="4" rx="1" fill="#E5E7EB" />
      {/* Taillights */}
      <rect x="8" y="54" width="6" height="3" rx="1" fill="#EF4444" />
      <rect x="26" y="54" width="6" height="3" rx="1" fill="#EF4444" />
    </svg>
  );
}

function ParkingSlotCell({
  slot,
  isSelected,
  onSelect,
}: {
  slot: ParkingSlot;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isAvailable = slot.status === "available";
  
  return (
    <button
      onClick={onSelect}
      disabled={!isAvailable && !isSelected}
      className={`
        relative w-12 h-16 sm:w-14 sm:h-20 flex items-center justify-center
        transition-all duration-200
        ${isSelected ? "ring-2 ring-primary ring-offset-2 rounded-lg bg-primary/10" : ""}
        ${isAvailable && !isSelected ? "hover:bg-primary/5 hover:scale-105 cursor-pointer" : ""}
        ${!isAvailable && !isSelected ? "cursor-default opacity-90" : ""}
      `}
      aria-label={`Lugar ${slot.code} - ${isAvailable ? "Disponible" : "Ocupado"}`}
    >
      <CarIcon status={slot.status} isSelected={isSelected} />
    </button>
  );
}

export function ParkingGrid({ slots, selectedSlotId, onSelectSlot }: ParkingGridProps) {
  // Group slots by row
  const rows = slots.reduce<Record<number, ParkingSlot[]>>((acc, slot) => {
    if (!acc[slot.row]) acc[slot.row] = [];
    acc[slot.row].push(slot);
    return acc;
  }, {});

  return (
    <div className="bg-background rounded-2xl p-4 sm:p-6 shadow-sm">
      {/* Parking lane indicator */}
      <div className="flex flex-col gap-3">
        {Object.entries(rows).map(([rowNum, rowSlots]) => (
          <div key={rowNum} className="flex items-center justify-center gap-1 sm:gap-2">
            {/* Left side slots */}
            <div className="flex gap-1 sm:gap-2">
              {rowSlots.slice(0, Math.ceil(rowSlots.length / 2)).map((slot) => (
                <ParkingSlotCell
                  key={slot.id}
                  slot={slot}
                  isSelected={slot.id === selectedSlotId}
                  onSelect={() => onSelectSlot(slot)}
                />
              ))}
            </div>
            
            {/* Lane divider */}
            <div className="w-8 sm:w-12 h-1 bg-foreground/10 rounded-full mx-1" />
            
            {/* Right side slots */}
            <div className="flex gap-1 sm:gap-2">
              {rowSlots.slice(Math.ceil(rowSlots.length / 2)).map((slot) => (
                <ParkingSlotCell
                  key={slot.id}
                  slot={slot}
                  isSelected={slot.id === selectedSlotId}
                  onSelect={() => onSelectSlot(slot)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-foreground/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#9CA3AF]" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#2563EB]" />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#F97316]" />
          <span>Seleccionado</span>
        </div>
      </div>
    </div>
  );
}
