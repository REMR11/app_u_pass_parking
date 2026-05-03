"use client";

import type { ParkingLevel } from "@/domain/parking/types";

interface LevelSelectorProps {
  levels: ParkingLevel[];
  selectedLevelId: string;
  onSelectLevel: (levelId: string) => void;
}

export function LevelSelector({ levels, selectedLevelId, onSelectLevel }: LevelSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {levels.map((level) => {
        const isSelected = level.id === selectedLevelId;
        const availableCount = level.slots.filter(s => s.status === "available").length;
        
        return (
          <button
            key={level.id}
            onClick={() => onSelectLevel(level.id)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${isSelected 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
              }
            `}
          >
            <span>{level.name}</span>
            <span className={`ml-2 ${isSelected ? "text-primary-foreground/80" : "text-foreground/50"}`}>
              ({availableCount} libres)
            </span>
          </button>
        );
      })}
    </div>
  );
}
