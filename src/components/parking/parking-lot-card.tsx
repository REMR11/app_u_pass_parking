"use client";

import type { ParkingLot } from "@/domain/parking/types";

interface ParkingLotCardProps {
  lot: ParkingLot;
  isSelected: boolean;
  onSelect: () => void;
  recommendation?: "nearest" | "cheapest" | "best";
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

const recommendationLabels = {
  nearest: { text: "Mas cercano", color: "bg-blue-100 text-blue-700" },
  cheapest: { text: "Mejor precio", color: "bg-green-100 text-green-700" },
  best: { text: "Recomendado", color: "bg-amber-100 text-amber-700" },
};

export function ParkingLotCard({ lot, isSelected, onSelect, recommendation }: ParkingLotCardProps) {
  const availabilityPercentage = (lot.availableSlots / lot.totalSlots) * 100;
  
  const getAvailabilityColor = () => {
    if (availabilityPercentage > 30) return "text-green-600";
    if (availabilityPercentage > 10) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left p-4 rounded-2xl border transition-all duration-200
        ${isSelected 
          ? "border-primary bg-primary/5 shadow-md" 
          : "border-foreground/10 bg-background hover:border-primary/30 hover:shadow-sm"
        }
      `}
    >
      {/* Recommendation badge */}
      {recommendation && (
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${recommendationLabels[recommendation].color}`}>
          {recommendationLabels[recommendation].text}
        </span>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{lot.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-foreground/60">
            <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{lot.address}</span>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">
          <StarIcon className="w-4 h-4 text-amber-500" filled />
          <span className="font-medium">{lot.rating}</span>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-foreground/5">
        {/* Distance */}
        <div className="text-sm">
          <span className="text-foreground/60">Distancia</span>
          <p className="font-medium">{lot.distanceMeters}m</p>
        </div>
        
        {/* Availability */}
        <div className="text-sm text-center">
          <span className="text-foreground/60">Disponibles</span>
          <p className={`font-medium flex items-center justify-center gap-1 ${getAvailabilityColor()}`}>
            <CarIcon className="w-4 h-4" />
            {lot.availableSlots}/{lot.totalSlots}
          </p>
        </div>
        
        {/* Price */}
        <div className="text-sm text-right">
          <span className="text-foreground/60">Por hora</span>
          <p className="font-semibold text-primary">
            ${lot.pricePerHour}
          </p>
        </div>
      </div>
    </button>
  );
}
