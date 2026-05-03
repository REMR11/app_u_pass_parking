"use client";

import type { ParkingSlot, ParkingLevel, ParkingLot } from "@/domain/parking/types";

interface SlotDetailsSheetProps {
  slot: ParkingSlot | null;
  level: ParkingLevel | null;
  lot: ParkingLot | null;
  onReserve: () => void;
  onClose: () => void;
}

export function SlotDetailsSheet({
  slot,
  level,
  lot,
  onReserve,
  onClose,
}: SlotDetailsSheetProps) {
  if (!slot || !level || !lot) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1100] animate-in slide-in-from-bottom duration-250">
      {/* Scrim */}
      <div
        className="fixed inset-0 bg-black/30 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet card */}
      <div className="bg-background rounded-t-3xl shadow-2xl border-t border-muted">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        <div className="px-5 pb-8 pt-3">
          {/* Location context — small, secondary */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {lot.name} &middot; {level.name}
          </p>

          {/* Slot code — hero element, must be readable at a glance */}
          <div className="flex items-end justify-between mt-2 mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Espacio seleccionado</p>
              <h2 className="text-5xl font-black text-foreground leading-none mt-0.5">
                {slot.code}
              </h2>
            </div>
            {/* Status badge */}
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success bg-success/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-success" />
              Disponible
            </span>
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between bg-muted/50 rounded-2xl px-4 py-3.5 mb-5">
            <div>
              <p className="text-xs text-muted-foreground">Tarifa</p>
              <p className="text-2xl font-bold text-primary">
                ${lot.pricePerHour.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground"> /hr</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Nivel</p>
              <p className="text-base font-semibold text-foreground">{level.aisle}</p>
            </div>
          </div>

          {/* Reserve CTA — full width, very tall for thumb reach */}
          <button
            onClick={onReserve}
            className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform shadow-lg"
          >
            Reservar espacio {slot.code}
          </button>

          {/* Cancel — text link, not a big button */}
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-sm text-muted-foreground font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
