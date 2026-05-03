"use client";

import type { ParkingSlot, ParkingLevel, ParkingLot } from "@/domain/parking/types";

interface SlotDetailsSheetProps {
  slot: ParkingSlot | null;
  level: ParkingLevel | null;
  lot: ParkingLot | null;
  onReserve: () => void;
  onClose: () => void;
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function TouchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 11V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v18l5-3.5L17 21l-.5-8.5" />
      <path d="M17 11a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9" />
    </svg>
  );
}

export function SlotDetailsSheet({ slot, level, lot, onReserve, onClose }: SlotDetailsSheetProps) {
  if (!slot || !level || !lot) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 -z-10" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div className="bg-background rounded-t-3xl shadow-2xl border-t border-foreground/10">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-foreground/20" />
        </div>
        
        <div className="px-6 pb-8">
          {/* Location info */}
          <p className="text-sm text-foreground/60">
            {level.name} - {level.aisle}
          </p>
          
          {/* Slot identifier */}
          <div className="flex items-center gap-2 mt-2">
            <MapPinIcon className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Lugar {slot.code}</h3>
          </div>
          
          {/* Status badge */}
          <span className="inline-block mt-2 text-sm font-medium text-green-600">
            Disponible
          </span>
          
          {/* Price info */}
          <div className="mt-4 p-3 bg-foreground/5 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground/70">Tarifa por hora</span>
              <span className="font-semibold">
                ${lot.pricePerHour} {lot.currency}
              </span>
            </div>
          </div>
          
          {/* Reserve button */}
          <button
            onClick={onReserve}
            className="w-full mt-6 flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 px-6 rounded-2xl font-medium text-lg transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <span>Reservar lugar</span>
            <TouchIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
