"use client";

import { useMemo } from "react";
import type { ParkingLevel, ParkingSlot } from "@/domain/parking/types";

interface FloorPlanMapProps {
  level: ParkingLevel;
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
}

const CELL = 22;    // px per grid cell
const GAP  = 2;     // px gap between cells

export function FloorPlanMap({
  level,
  selectedSlotId,
  onSelectSlot,
}: FloorPlanMapProps) {
  // Build a lookup map slotId → ParkingSlot for fast access
  const slotById = useMemo(() => {
    const map: Record<string, ParkingSlot> = {};
    for (const s of level.slots) map[s.id] = s;
    return map;
  }, [level.slots]);

  const cols = level.gridCols;
  const rows = level.gridRows;
  const svgW = cols * (CELL + GAP) + GAP;
  const svgH = rows * (CELL + GAP) + GAP;

  const selectedSlot = selectedSlotId ? slotById[selectedSlotId] : null;

  return (
    <div className="w-full overflow-x-auto pb-2">
      {/* Mini-map header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Plano — {level.name}
        </span>
        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#d1fae5] border border-[#6ee7b7] inline-block" />
            Libre
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#dbeafe] border border-[#93c5fd] inline-block" />
            Discapacidad
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#fef9c3] border border-[#fde047] inline-block" />
            A. Mayor
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        style={{ maxHeight: 220, display: "block" }}
        role="img"
        aria-label={`Plano del ${level.name}`}
      >
        {/* Background */}
        <rect width={svgW} height={svgH} fill="#f8fafc" rx="8" />

        {level.floorPlan.map((row, r) =>
          row.map((cell, c) => {
            const x = GAP + c * (CELL + GAP);
            const y = GAP + r * (CELL + GAP);

            // ── empty / outside
            if (cell.type === "empty") return null;

            // ── wall / pillar
            if (cell.type === "wall") {
              return (
                <rect
                  key={`${r}-${c}`}
                  x={x} y={y}
                  width={CELL} height={CELL}
                  fill="#94a3b8"
                  rx={2}
                />
              );
            }

            // ── road / driving lane
            if (cell.type === "road") {
              return (
                <rect
                  key={`${r}-${c}`}
                  x={x} y={y}
                  width={CELL} height={CELL}
                  fill="#e2e8f0"
                  rx={1}
                />
              );
            }

            // ── entrance
            if (cell.type === "entrance") {
              return (
                <g key={`${r}-${c}`}>
                  <rect
                    x={x} y={y}
                    width={CELL} height={CELL}
                    fill="#bfdbfe"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    rx={2}
                  />
                  <text
                    x={x + CELL / 2}
                    y={y + CELL / 2 + 3.5}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill="#1d4ed8"
                  >
                    E
                  </text>
                </g>
              );
            }

            // ── slot
            if (cell.type === "slot" && cell.slotId) {
              const slot = slotById[cell.slotId];
              if (!slot) return null;

              const isSelected = slot.id === selectedSlotId;
              const isAvailable = slot.status === "available";

              // Fill colour by category + status
              let fill = "#e2e8f0";      // occupied grey
              let stroke = "#cbd5e1";
              let strokeW = 1;

              if (isSelected) {
                fill = "#f97316";        // orange — selected
                stroke = "#ea580c";
                strokeW = 2;
              } else if (isAvailable) {
                if (slot.category === "accessible") {
                  fill = "#dbeafe";
                  stroke = "#93c5fd";
                } else if (slot.category === "elderly") {
                  fill = "#fef9c3";
                  stroke = "#fde047";
                } else {
                  fill = "#d1fae5";
                  stroke = "#6ee7b7";
                }
              } else {
                // occupied
                if (slot.category === "accessible") {
                  fill = "#e0f2fe";
                  stroke = "#7dd3fc";
                } else if (slot.category === "elderly") {
                  fill = "#fefce8";
                  stroke = "#fef08a";
                }
              }

              return (
                <g
                  key={`${r}-${c}`}
                  onClick={isAvailable ? () => onSelectSlot(slot) : undefined}
                  style={{ cursor: isAvailable ? "pointer" : "default" }}
                  role={isAvailable ? "button" : undefined}
                  aria-label={isAvailable ? `Seleccionar espacio ${slot.code}` : undefined}
                >
                  <rect
                    x={x} y={y}
                    width={CELL} height={CELL}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeW}
                    rx={3}
                  />

                  {/* Selected: animated orange car */}
                  {isSelected && (
                    <g>
                      <style>{`
                        @keyframes car-bounce {
                          0%, 100% { transform: translateY(0px); }
                          50% { transform: translateY(-2px); }
                        }
                        .car-selected { animation: car-bounce 0.8s ease-in-out infinite; transform-origin: center; }
                      `}</style>
                      <g
                        className="car-selected"
                        transform={`translate(${x + CELL / 2}, ${y + CELL / 2})`}
                      >
                        {/* Car body */}
                        <rect x={-6} y={-5} width={12} height={10} rx={2} fill="#f97316" />
                        {/* Roof */}
                        <rect x={-4} y={-8} width={8} height={4} rx={1.5} fill="#ea580c" />
                        {/* Front windshield */}
                        <rect x={-3} y={-7.5} width={6} height={2.5} rx={1} fill="#fed7aa" opacity={0.8} />
                        {/* Headlights */}
                        <rect x={-6.5} y={-2.5} width={2} height={2} rx={0.5} fill="#fef3c7" />
                        <rect x={4.5} y={-2.5} width={2} height={2} rx={0.5} fill="#fef3c7" />
                        {/* Wheels */}
                        <rect x={-7} y={-4} width={2.5} height={3.5} rx={1} fill="#1e293b" />
                        <rect x={4.5} y={-4} width={2.5} height={3.5} rx={1} fill="#1e293b" />
                        <rect x={-7} y={1} width={2.5} height={3.5} rx={1} fill="#1e293b" />
                        <rect x={4.5} y={1} width={2.5} height={3.5} rx={1} fill="#1e293b" />
                      </g>
                    </g>
                  )}

                  {/* Accessible: wheelchair icon (simplified) */}
                  {!isSelected && slot.category === "accessible" && (
                    <text
                      x={x + CELL / 2}
                      y={y + CELL / 2 + 3.5}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isAvailable ? "#2563eb" : "#93c5fd"}
                    >
                      ♿
                    </text>
                  )}

                  {/* Elderly: person icon (text) */}
                  {!isSelected && slot.category === "elderly" && (
                    <text
                      x={x + CELL / 2}
                      y={y + CELL / 2 + 3.5}
                      textAnchor="middle"
                      fontSize="9"
                      fill={isAvailable ? "#a16207" : "#fde047"}
                    >
                      🧓
                    </text>
                  )}

                  {/* Entrance proximity indicator — small dot on closest standard slots */}
                  {!isSelected && slot.category === "standard" && slot.entranceProximity <= 3 && isAvailable && (
                    <circle
                      cx={x + CELL - 4}
                      cy={y + 4}
                      r={2.5}
                      fill="#22c55e"
                    />
                  )}
                </g>
              );
            }

            return null;
          })
        )}
      </svg>

      {/* Entrance proximity legend note */}
      <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-success flex-shrink-0" />
        Punto verde = espacio cercano al acceso
      </p>
    </div>
  );
}
