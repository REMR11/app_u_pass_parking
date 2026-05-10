"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { ParkingLevel, ParkingSlot } from "@/domain/parking/types";

interface FloorPlanMapProps {
  level: ParkingLevel;
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
}

const GAP = 2; // px gap between cells

export function FloorPlanMap({
  level,
  selectedSlotId,
  onSelectSlot,
}: FloorPlanMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);

  // Observe container width for responsive cell sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    ro.observe(el);
    // Set initial width immediately
    setContainerWidth(el.getBoundingClientRect().width || 320);
    return () => ro.disconnect();
  }, []);

  // Build slot lookup map
  const slotById = useMemo(() => {
    const map: Record<string, ParkingSlot> = {};
    if (!level?.slots) return map;
    for (const s of level.slots) map[s.id] = s;
    return map;
  }, [level?.slots]);

  // Guard
  if (!level?.floorPlan || !level.slots || !level.gridCols || !level.gridRows) {
    return (
      <div className="h-28 flex items-center justify-center text-sm text-muted-foreground">
        Cargando plano...
      </div>
    );
  }

  const cols = level.gridCols;
  const rows = level.gridRows;

  // Cell size derived from container width so the plan always fits
  const CELL = Math.max(
    10,
    Math.floor((containerWidth - GAP) / cols) - GAP
  );

  const svgW = cols * (CELL + GAP) + GAP;
  const svgH = rows * (CELL + GAP) + GAP;

  return (
    <div ref={containerRef} className="w-full">
      {/* Header + legend */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-y-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Plano — {level.name}
        </span>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
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

      {/* SVG floor plan — always fills container width */}
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: "block", width: "100%", height: "auto" }}
        role="img"
        aria-label={`Plano del ${level.name}`}
      >
        {/* Background */}
        <rect width={svgW} height={svgH} fill="#f8fafc" rx="6" />

        {level.floorPlan.map((row, r) =>
          row.map((cell, c) => {
            const x = GAP + c * (CELL + GAP);
            const y = GAP + r * (CELL + GAP);

            if (cell.type === "empty") return null;

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
                  {CELL >= 14 && (
                    <text
                      x={x + CELL / 2}
                      y={y + CELL / 2 + 3.5}
                      textAnchor="middle"
                      fontSize={Math.max(6, CELL * 0.42)}
                      fontWeight="700"
                      fill="#1d4ed8"
                    >
                      E
                    </text>
                  )}
                </g>
              );
            }

            if (cell.type === "slot" && cell.slotId) {
              const slot = slotById[cell.slotId];
              if (!slot) return null;

              const isSelected = slot.id === selectedSlotId;
              const isAvailable = slot.status === "available";

              let fill = "#e2e8f0";
              let stroke = "#cbd5e1";
              let strokeW = 1;

              if (isSelected) {
                fill = "#f97316";
                stroke = "#ea580c";
                strokeW = 2;
              } else if (isAvailable) {
                if (slot.category === "accessible") {
                  fill = "#dbeafe"; stroke = "#93c5fd";
                } else if (slot.category === "elderly") {
                  fill = "#fef9c3"; stroke = "#fde047";
                } else {
                  fill = "#d1fae5"; stroke = "#6ee7b7";
                }
              } else {
                if (slot.category === "accessible") {
                  fill = "#e0f2fe"; stroke = "#7dd3fc";
                } else if (slot.category === "elderly") {
                  fill = "#fefce8"; stroke = "#fef08a";
                }
              }

              // Icon font size scales with cell
              const iconSize = Math.max(6, CELL * 0.55);
              // Car parts scale factor
              const scale = CELL / 22;

              return (
                <g
                  key={`${r}-${c}`}
                  onClick={isAvailable ? () => onSelectSlot(slot) : undefined}
                  style={{ cursor: isAvailable ? "pointer" : "default" }}
                  role={isAvailable ? "button" : undefined}
                  aria-label={
                    isAvailable ? `Seleccionar espacio ${slot.code}` : undefined
                  }
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
                          50%       { transform: translateY(-${Math.max(1, 2 * scale)}px); }
                        }
                        .car-selected-g {
                          animation: car-bounce 0.8s ease-in-out infinite;
                          transform-origin: center;
                        }
                      `}</style>
                      <g
                        className="car-selected-g"
                        transform={`translate(${x + CELL / 2}, ${y + CELL / 2})`}
                      >
                        {/* Body */}
                        <rect
                          x={-6 * scale} y={-5 * scale}
                          width={12 * scale} height={10 * scale}
                          rx={2 * scale}
                          fill="#f97316"
                        />
                        {/* Roof */}
                        <rect
                          x={-4 * scale} y={-8 * scale}
                          width={8 * scale} height={4 * scale}
                          rx={1.5 * scale}
                          fill="#ea580c"
                        />
                        {/* Windshield */}
                        <rect
                          x={-3 * scale} y={-7.5 * scale}
                          width={6 * scale} height={2.5 * scale}
                          rx={scale}
                          fill="#fed7aa"
                          opacity={0.8}
                        />
                        {/* Wheels */}
                        {[[-7, -4], [4.5, -4], [-7, 1], [4.5, 1]].map(([wx, wy], i) => (
                          <rect
                            key={i}
                            x={wx * scale} y={wy * scale}
                            width={2.5 * scale} height={3.5 * scale}
                            rx={scale}
                            fill="#1e293b"
                          />
                        ))}
                      </g>
                    </g>
                  )}

                  {/* Category icons — only when cell is large enough */}
                  {!isSelected && CELL >= 14 && slot.category === "accessible" && (
                    <text
                      x={x + CELL / 2}
                      y={y + CELL / 2 + iconSize * 0.35}
                      textAnchor="middle"
                      fontSize={iconSize}
                      fill={isAvailable ? "#2563eb" : "#93c5fd"}
                    >
                      ♿
                    </text>
                  )}
                  {!isSelected && CELL >= 14 && slot.category === "elderly" && (
                    <text
                      x={x + CELL / 2}
                      y={y + CELL / 2 + iconSize * 0.35}
                      textAnchor="middle"
                      fontSize={iconSize}
                      fill={isAvailable ? "#a16207" : "#fde047"}
                    >
                      🧓
                    </text>
                  )}

                  {/* Entrance-proximity dot — only on large enough cells */}
                  {!isSelected &&
                    slot.category === "standard" &&
                    slot.entranceProximity <= 3 &&
                    isAvailable &&
                    CELL >= 12 && (
                      <circle
                        cx={x + CELL - 3}
                        cy={y + 3}
                        r={Math.max(1.5, 2.5 * scale)}
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

      {/* Proximity note */}
      <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-success flex-shrink-0" />
        Punto verde = espacio cercano al acceso
      </p>
    </div>
  );
}
