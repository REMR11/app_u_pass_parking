"use client";

import type { ParkingLot } from "@/domain/parking/types";

type ParkingListCardProps = {
  lot: ParkingLot;
  isSelected: boolean;
  onSelect: (lot: ParkingLot) => void;
  rank?: number;
};

export function ParkingListCard({ lot, isSelected, onSelect }: ParkingListCardProps) {
  const availabilityPercent = (lot.availableSlots / lot.totalSlots) * 100;
  const isLarge = lot.facilityType === "large";

  // Get initials from lot name
  const getInitials = (name: string) => {
    const words = name.split(/[\s-]+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Determine badge color based on availability
  const getBadgeColor = () => {
    if (availabilityPercent >= 50) return "bg-green-600";
    if (availabilityPercent >= 20) return "bg-amber-500";
    return "bg-red-500";
  };

  // Format capacity label for display
  const getCapacityLabel = () => {
    const cap = lot.totalCapacity;
    if (cap >= 1000) return `${(cap / 1000).toFixed(1)}k espacios`;
    return `${cap} espacios`;
  };

  // Determine if lot is available
  const isAvailable = lot.availableSlots > 0;

  return (
    <button
      onClick={() => onSelect(lot)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-transparent bg-white hover:border-muted hover:shadow-sm"
      }`}
    >
      <div className="flex gap-3">
        {/* Initials badge */}
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${getBadgeColor()}`}
        >
          {getInitials(lot.name)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-semibold text-foreground truncate text-sm">
                {lot.name}
              </h3>
              {/* Facility type indicator */}
              {isLarge ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded flex-shrink-0 leading-none">
                  GRANDE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0 leading-none">
                  LOCAL
                </span>
              )}
            </div>
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                No disponible
              </span>
            )}
          </div>

          {/* Address */}
          <p className="text-xs text-muted-foreground truncate mb-2">
            {lot.address}
          </p>

          {/* Price and rating row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-primary font-bold text-sm">
                ${lot.pricePerHour.toFixed(2)}
                <span className="text-xs font-normal text-muted-foreground">/hr</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {lot.rating}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {lot.distanceMeters >= 1000
                ? `${(lot.distanceMeters / 1000).toFixed(1)} km`
                : `${lot.distanceMeters} m`}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {lot.availableSlots}/{lot.totalSlots} lugares
            </span>
            {lot.levels.length > 1 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {lot.levels.length} niveles
              </span>
            )}
            {/* Capacity context tag */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isLarge
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {getCapacityLabel()}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
