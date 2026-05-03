"use client";

import type { ParkingLot } from "@/domain/parking/types";

type LotPreviewCardProps = {
  lot: ParkingLot;
  onViewDetails: () => void;
  onClose: () => void;
};

export function LotPreviewCard({ lot, onViewDetails, onClose }: LotPreviewCardProps) {
  const availabilityPercent = (lot.availableSlots / lot.totalSlots) * 100;
  
  return (
    <div className="absolute bottom-24 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 animate-in slide-in-from-bottom">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
        aria-label="Cerrar"
      >
        <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="font-semibold text-foreground truncate">{lot.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{lot.address}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4">
        {/* Distance */}
        <div className="flex items-center gap-1.5 text-sm">
          <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="10" r="3" />
            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
          </svg>
          <span className="text-muted-foreground">
            {lot.distanceMeters < 1000 
              ? `${lot.distanceMeters}m` 
              : `${(lot.distanceMeters / 1000).toFixed(1)}km`}
          </span>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-1.5 text-sm">
          <div 
            className={`w-2 h-2 rounded-full ${
              availabilityPercent > 50 
                ? "bg-green-500" 
                : availabilityPercent > 20 
                  ? "bg-yellow-500" 
                  : "bg-red-500"
            }`} 
          />
          <span className={
            availabilityPercent > 50 
              ? "text-green-600" 
              : availabilityPercent > 20 
                ? "text-yellow-600" 
                : "text-red-600"
          }>
            {lot.availableSlots} disponibles
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">
          <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-muted-foreground">{lot.rating}</span>
        </div>
      </div>

      {/* Price and CTA */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-foreground">${lot.pricePerHour}</span>
          <span className="text-sm text-muted-foreground">/{lot.currency === "MXN" ? "hora" : "hr"}</span>
        </div>
        <button
          onClick={onViewDetails}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          Ver lugares
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
