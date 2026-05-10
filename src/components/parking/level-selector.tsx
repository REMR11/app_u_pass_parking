"use client";

import type { ParkingLevel } from "@/domain/parking/types";

interface LevelSelectorProps {
  levels: ParkingLevel[];
  selectedLevelId: string;
  onSelectLevel: (levelId: string) => void;
}

export function LevelSelector({
  levels,
  selectedLevelId,
  onSelectLevel,
}: LevelSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {levels.map((level) => {
        const isSelected = level.id === selectedLevelId;
        const available = level.slots.filter((s) => s.status === "available").length;
        const hasAvailable = available > 0;

        return (
          <button
            key={level.id}
            onClick={() => onSelectLevel(level.id)}
            aria-pressed={isSelected}
            className={`
              flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl
              border-2 transition-all duration-150 active:scale-[0.97]
              ${
                isSelected
                  ? "bg-primary border-primary text-primary-foreground shadow-md"
                  : "bg-background border-muted text-foreground hover:border-primary/40"
              }
            `}
          >
            {/* Level label */}
            <span className="font-semibold text-sm">{level.name}</span>

            {/* Available count pill */}
            <span
              className={`
                text-xs font-bold px-2 py-0.5 rounded-full leading-none
                ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : hasAvailable
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground"
                }
              `}
            >
              {available}
            </span>
          </button>
        );
      })}
    </div>
  );
}
