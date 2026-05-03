"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import type { ParkingLevel, ParkingSlot } from "@/domain/parking/types";

interface InteractiveFloorPlanProps {
  level: ParkingLevel;
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
}

const GAP = 2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

export function InteractiveFloorPlan({
  level,
  selectedSlotId,
  onSelectSlot,
}: InteractiveFloorPlanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [containerWidth, setContainerWidth] = useState(320);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Observe container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    ro.observe(el);
    setContainerWidth(el.getBoundingClientRect().width || 320);
    return () => ro.disconnect();
  }, [isFullscreen]);

  // Reset zoom/pan when level changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [level.id]);

  // Build slot lookup
  const slotById = useMemo(() => {
    const map: Record<string, ParkingSlot> = {};
    if (!level?.slots) return map;
    for (const s of level.slots) map[s.id] = s;
    return map;
  }, [level?.slots]);

  // Guard
  if (!level?.floorPlan || !level.slots || !level.gridCols || !level.gridRows) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        Cargando plano...
      </div>
    );
  }

  const cols = level.gridCols;
  const rows = level.gridRows;
  const baseCell = Math.max(12, Math.floor((containerWidth - GAP) / cols) - GAP);
  const CELL = baseCell;

  const svgW = cols * (CELL + GAP) + GAP;
  const svgH = rows * (CELL + GAP) + GAP;

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - 0.25));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
    // Reset view on toggle
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Pan handlers
  const handlePanStart = (clientX: number, clientY: number) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    setLastPanPoint({ x: clientX, y: clientY });
  };

  const handlePanMove = (clientX: number, clientY: number) => {
    if (!isPanning) return;
    const dx = clientX - lastPanPoint.x;
    const dy = clientY - lastPanPoint.y;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    setLastPanPoint({ x: clientX, y: clientY });
  };

  const handlePanEnd = () => setIsPanning(false);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => handlePanStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handlePanMove(e.clientX, e.clientY);
  const onMouseUp = () => handlePanEnd();
  const onMouseLeave = () => handlePanEnd();

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const onTouchEnd = () => handlePanEnd();

  // Wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
  };

  // Available/occupied counts
  const availableCount = level.slots.filter((s) => s.status === "available").length;
  const totalCount = level.slots.length;

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-[9999] bg-background flex flex-col"
    : "relative";

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Header */}
      <div className={`flex items-center justify-between gap-3 ${isFullscreen ? "px-4 py-3 border-b border-muted" : "mb-3"}`}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-foreground">{level.name}</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            availableCount > 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
          }`}>
            {availableCount}/{totalCount} libres
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground disabled:opacity-40 active:scale-95 transition-all"
            aria-label="Alejar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
            </svg>
          </button>
          <span className="text-xs font-mono font-bold text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground disabled:opacity-40 active:scale-95 transition-all"
            aria-label="Acercar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            onClick={handleResetView}
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground active:scale-95 transition-all ml-1"
            aria-label="Restablecer vista"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-all ml-1"
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className={`flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap ${isFullscreen ? "px-4 py-2 bg-muted/30 border-b border-muted" : "mb-3"}`}>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[#d1fae5] border border-[#6ee7b7]" />
          Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[#e2e8f0] border border-[#cbd5e1]" />
          Ocupado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[#dbeafe] border border-[#93c5fd]" />
          Discapacidad
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[#fef9c3] border border-[#fde047]" />
          A. Mayor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[#f97316] border border-[#ea580c]" />
          Seleccionado
        </span>
      </div>

      {/* Floor plan container */}
      <div
        className={`overflow-hidden bg-slate-100 rounded-xl border border-muted ${isFullscreen ? "flex-1" : ""}`}
        style={{ cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.15s ease-out",
            width: "100%",
            height: isFullscreen ? "100%" : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isFullscreen ? "24px" : "12px",
          }}
        >
          <svg
            ref={svgRef}
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ display: "block", maxWidth: "100%", height: "auto" }}
            role="img"
            aria-label={`Plano del ${level.name}`}
          >
            {/* Background */}
            <rect width={svgW} height={svgH} fill="#f1f5f9" rx="8" />

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
                      fill="#64748b"
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
                      fill="#cbd5e1"
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
                        fill="#93c5fd"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        rx={3}
                      />
                      {CELL >= 16 && (
                        <text
                          x={x + CELL / 2}
                          y={y + CELL / 2 + 4}
                          textAnchor="middle"
                          fontSize={Math.max(8, CELL * 0.4)}
                          fontWeight="800"
                          fill="#1e40af"
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
                    strokeW = 3;
                  } else if (isAvailable) {
                    if (slot.category === "accessible") {
                      fill = "#dbeafe"; stroke = "#3b82f6"; strokeW = 1.5;
                    } else if (slot.category === "elderly") {
                      fill = "#fef9c3"; stroke = "#eab308"; strokeW = 1.5;
                    } else {
                      fill = "#d1fae5"; stroke = "#22c55e"; strokeW = 1.5;
                    }
                  }

                  const iconSize = Math.max(8, CELL * 0.5);
                  const scale = CELL / 24;

                  return (
                    <g
                      key={`${r}-${c}`}
                      onClick={isAvailable ? () => onSelectSlot(slot) : undefined}
                      style={{ cursor: isAvailable ? "pointer" : "default" }}
                      role={isAvailable ? "button" : undefined}
                      tabIndex={isAvailable ? 0 : undefined}
                      aria-label={isAvailable ? `Seleccionar espacio ${slot.code}` : `Espacio ${slot.code} ocupado`}
                    >
                      <rect
                        x={x} y={y}
                        width={CELL} height={CELL}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeW}
                        rx={4}
                      />

                      {/* Slot code - show when zoomed or cell large enough */}
                      {CELL >= 20 && !isSelected && (
                        <text
                          x={x + CELL / 2}
                          y={y + CELL / 2 + 4}
                          textAnchor="middle"
                          fontSize={Math.max(7, CELL * 0.32)}
                          fontWeight="700"
                          fill={isAvailable ? "#0f172a" : "#94a3b8"}
                        >
                          {slot.code.split("-")[1] || slot.code}
                        </text>
                      )}

                      {/* Selected indicator - animated car */}
                      {isSelected && (
                        <g>
                          <style>{`
                            @keyframes car-pulse {
                              0%, 100% { transform: scale(1); }
                              50% { transform: scale(1.1); }
                            }
                            .car-pulse { animation: car-pulse 1s ease-in-out infinite; }
                          `}</style>
                          <g
                            className="car-pulse"
                            transform={`translate(${x + CELL / 2}, ${y + CELL / 2})`}
                            style={{ transformOrigin: `${x + CELL / 2}px ${y + CELL / 2}px` }}
                          >
                            <rect
                              x={-5 * scale} y={-4 * scale}
                              width={10 * scale} height={8 * scale}
                              rx={2 * scale} fill="#fff"
                            />
                            <rect
                              x={-3.5 * scale} y={-6 * scale}
                              width={7 * scale} height={3 * scale}
                              rx={1.5 * scale} fill="#fff"
                            />
                          </g>
                        </g>
                      )}

                      {/* Category icons */}
                      {!isSelected && CELL >= 18 && slot.category === "accessible" && (
                        <text
                          x={x + CELL / 2}
                          y={y + CELL / 2 + iconSize * 0.3}
                          textAnchor="middle"
                          fontSize={iconSize}
                          fill={isAvailable ? "#2563eb" : "#93c5fd"}
                        >
                          ♿
                        </text>
                      )}
                      {!isSelected && CELL >= 18 && slot.category === "elderly" && (
                        <text
                          x={x + CELL / 2}
                          y={y + CELL / 2 + iconSize * 0.3}
                          textAnchor="middle"
                          fontSize={iconSize}
                          fill={isAvailable ? "#ca8a04" : "#fde047"}
                        >
                          🧓
                        </text>
                      )}

                      {/* Proximity indicator */}
                      {!isSelected && slot.category === "standard" && slot.entranceProximity <= 3 && isAvailable && CELL >= 14 && (
                        <circle
                          cx={x + CELL - 4}
                          cy={y + 4}
                          r={3}
                          fill="#22c55e"
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      )}
                    </g>
                  );
                }

                return null;
              })
            )}
          </svg>
        </div>
      </div>

      {/* Bottom help text */}
      <div className={`flex items-center justify-between text-[11px] text-muted-foreground ${isFullscreen ? "px-4 py-2 border-t border-muted" : "mt-2"}`}>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          Punto verde = cerca del acceso
        </span>
        {zoom > 1 && (
          <span className="text-muted-foreground/60">Arrastra para moverte por el plano</span>
        )}
      </div>

      {/* Fullscreen close button - always visible */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-xl active:scale-95 transition-all z-10"
          aria-label="Cerrar pantalla completa"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
