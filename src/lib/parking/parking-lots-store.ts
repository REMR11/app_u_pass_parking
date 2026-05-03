import type { ParkingLot, ParkingSlot, ParkingLevel, FloorPlanCell, CellType, SlotStatus } from "@/domain/parking/types";

/**
 * Deterministic pseudo-random based on a seed integer.
 * Returns a value in [0, 1). Replaces Math.random() so SSR and client
 * produce identical slot-status arrays and avoid hydration mismatches.
 */
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/**
 * Mock data for parking lots with pre-designed floor-plan layouts.
 * Replace with real API/database integration.
 */

// ──────────────────────────────────────────────────────────────────────────────
// LEVEL GENERATOR (pre-designed layouts per lot)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Builds a simple parking level layout with accessibility zones.
 * 
 * Layout key:
 *  E = entrance
 *  R = road/aisle
 *  S = standard slot
 *  A = accessible slot
 *  O = elderly slot
 *  W = wall/pillar
 *  . = empty/outside
 *
 * entranceProximity: 1 = closest to entrance, higher = farther
 */

function buildLayoutA(levelId: string): ParkingLevel {
  // 8x12 grid — compact layout for regional centers
  const grid: Array<CellType[]> = [
    ["empty", "empty", "entrance", "entrance", "entrance", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
    ["empty", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "empty"],
    ["wall", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "wall"],
    ["wall", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "wall"],
    ["wall", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "wall"],
    ["wall", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "wall"],
    ["wall", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "slot", "wall"],
    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
  ];

  const slots: ParkingSlot[] = [];
  const floorPlan: FloorPlanCell[][] = [];
  let slotIndex = 0;

  for (let r = 0; r < grid.length; r++) {
    const planRow: FloorPlanCell[] = [];
    for (let c = 0; c < grid[r].length; c++) {
      const cellType = grid[r][c];
      const cell: FloorPlanCell = { type: cellType };

      if (cellType === "entrance") {
        cell.label = "E1";
      } else if (cellType === "slot") {
        // Accessible slots near entrance (row 2, first two)
        // Elderly slots near entrance (row 2, next two)
        const isAccessible = r === 2 && (c === 1 || c === 2);
        const isElderly = r === 2 && (c === 3 || c === 4);
        const category = isAccessible ? "accessible" : isElderly ? "elderly" : "standard";
        const proximityScore = Math.abs(r - 0) + Math.abs(c - 3); // Distance from entrance row 0, center col 3

        const slotCode = `${String.fromCharCode(65 + r)}-${slotIndex + 1}`;
        const slotId = `${levelId}-slot-${slotIndex}`;
        slotIndex++;

        // Deterministic occupation — avoids SSR/client hydration mismatch
        const status: SlotStatus = seededRand(slotIndex) > 0.4 ? "occupied" : "available";

        slots.push({
          id: slotId,
          code: slotCode,
          status,
          category,
          row: r,
          col: c,
          entranceProximity: proximityScore,
        });

        cell.slotId = slotId;
      }

      planRow.push(cell);
    }
    floorPlan.push(planRow);
  }

  return {
    id: levelId,
    name: "Nivel 1",
    aisle: "Pasillo A",
    slots,
    floorPlan,
    gridCols: grid[0].length,
    gridRows: grid.length,
  };
}

function buildLayoutB(levelId: string): ParkingLevel {
  // 10x16 grid — large commercial center with multiple aisles
  const grid: Array<CellType[]> = [
    ["empty", "empty", "empty", "entrance", "entrance", "entrance", "entrance", "entrance", "entrance", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
    ["empty", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "empty"],
    ["wall", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "wall"],
    ["wall", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "wall"],
    ["wall", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "wall"],
    ["wall", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "road", "wall"],
    ["wall", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "wall"],
    ["wall", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "wall"],
    ["wall", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "road", "slot", "slot", "slot", "slot", "wall"],
    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
  ];

  const slots: ParkingSlot[] = [];
  const floorPlan: FloorPlanCell[][] = [];
  let slotIndex = 0;

  for (let r = 0; r < grid.length; r++) {
    const planRow: FloorPlanCell[] = [];
    for (let c = 0; c < grid[r].length; c++) {
      const cellType = grid[r][c];
      const cell: FloorPlanCell = { type: cellType };

      if (cellType === "entrance") {
        cell.label = c < 6 ? "E1" : "E2";
      } else if (cellType === "slot") {
        // Accessible: row 2, col 1-2
        // Elderly: row 2, col 3-4
        const isAccessible = r === 2 && (c === 1 || c === 2);
        const isElderly = r === 2 && (c === 3 || c === 4);
        const category = isAccessible ? "accessible" : isElderly ? "elderly" : "standard";
        const proximityScore = Math.abs(r - 0) + Math.abs(c - 5); // Distance from entrance

        const slotCode = `${String.fromCharCode(65 + Math.floor(slotIndex / 15))}-${(slotIndex % 15) + 1}`;
        const slotId = `${levelId}-slot-${slotIndex}`;
        slotIndex++;

        // Deterministic occupation — avoids SSR/client hydration mismatch
        const status: SlotStatus = seededRand(slotIndex + 1000) > 0.35 ? "occupied" : "available";

        slots.push({
          id: slotId,
          code: slotCode,
          status,
          category,
          row: r,
          col: c,
          entranceProximity: proximityScore,
        });

        cell.slotId = slotId;
      }

      planRow.push(cell);
    }
    floorPlan.push(planRow);
  }

  return {
    id: levelId,
    name: "Nivel 1",
    aisle: "Pasillo Principal",
    slots,
    floorPlan,
    gridCols: grid[0].length,
    gridRows: grid.length,
  };
}

// Default center: San Salvador, El Salvador (Colonia Escalon / Zona Rosa)
export const DEFAULT_CENTER = { lat: 13.7006, lng: -89.2295 };

/**
 * Parking lots with real El Salvador capacity data and pre-designed layouts.
 *
 * Large commercial centers  → totalCapacity 1,500–3,000  facilityType "large"
 * Regional / local centers  → totalCapacity  100–300     facilityType "regional"
 */
const parkingLots: ParkingLot[] = [
  // ── LARGE COMMERCIAL CENTERS ───────────────────────────────────────────
  {
    id: "lot-001",
    buildingId: "bld-001",
    name: "Metrocentro S.S.",
    address: "Blvd. de los Héroes, San Salvador",
    coordinates: { lat: 13.7063, lng: -89.2113 },
    distanceMeters: 680,
    pricePerHour: 0.50,
    currency: "USD",
    facilityType: "large",
    totalCapacity: 2800,
    levels: [
      buildLayoutB("lot-001-level-1"),
      buildLayoutB("lot-001-level-2"),
      buildLayoutB("lot-001-level-3"),
    ],
    totalSlots: 180,
    availableSlots: 65,
    rating: 4.3,
  },
  {
    id: "lot-002",
    buildingId: "bld-002",
    name: "Multiplaza",
    address: "Urb. Madre Selva, Antiguo Cuscatlán",
    coordinates: { lat: 13.6782, lng: -89.2508 },
    distanceMeters: 2300,
    pricePerHour: 1.50,
    currency: "USD",
    facilityType: "large",
    totalCapacity: 3000,
    levels: [
      buildLayoutB("lot-002-level-1"),
      buildLayoutB("lot-002-level-2"),
      buildLayoutB("lot-002-level-3"),
      buildLayoutB("lot-002-level-4"),
    ],
    totalSlots: 240,
    availableSlots: 45,
    rating: 4.6,
  },
  {
    id: "lot-003",
    buildingId: "bld-003",
    name: "La Gran Vía",
    address: "Carretera Panamericana Km 11.5, Antiguo Cuscatlán",
    coordinates: { lat: 13.6701, lng: -89.2520 },
    distanceMeters: 3100,
    pricePerHour: 1.00,
    currency: "USD",
    facilityType: "large",
    totalCapacity: 1800,
    levels: [
      buildLayoutB("lot-003-level-1"),
      buildLayoutB("lot-003-level-2"),
      buildLayoutB("lot-003-level-3"),
    ],
    totalSlots: 180,
    availableSlots: 72,
    rating: 4.7,
  },
  {
    id: "lot-004",
    buildingId: "bld-004",
    name: "Galerías Escalón",
    address: "Paseo General Escalón, Col. Escalón",
    coordinates: { lat: 13.7015, lng: -89.2390 },
    distanceMeters: 950,
    pricePerHour: 1.00,
    currency: "USD",
    facilityType: "large",
    totalCapacity: 1600,
    levels: [
      buildLayoutB("lot-004-level-1"),
      buildLayoutB("lot-004-level-2"),
    ],
    totalSlots: 120,
    availableSlots: 22,
    rating: 4.4,
  },
  // ── REGIONAL / LOCAL CENTERS ───────────────────────────────────────────
  {
    id: "lot-005",
    buildingId: "bld-005",
    name: "Plaza Bambú",
    address: "Av. Masferrer Norte, Col. Maquilishuat",
    coordinates: { lat: 13.7090, lng: -89.2320 },
    distanceMeters: 420,
    pricePerHour: 0.75,
    currency: "USD",
    facilityType: "regional",
    totalCapacity: 180,
    levels: [buildLayoutA("lot-005-level-1")],
    totalSlots: 40,
    availableSlots: 14,
    rating: 4.0,
  },
  {
    id: "lot-006",
    buildingId: "bld-006",
    name: "Los Encuentros",
    address: "Blvd. del Ejército, Soyapango",
    coordinates: { lat: 13.7195, lng: -89.1780 },
    distanceMeters: 5400,
    pricePerHour: 0.50,
    currency: "USD",
    facilityType: "regional",
    totalCapacity: 280,
    levels: [buildLayoutA("lot-006-level-1"), buildLayoutA("lot-006-level-2")],
    totalSlots: 80,
    availableSlots: 38,
    rating: 3.9,
  },
  {
    id: "lot-007",
    buildingId: "bld-007",
    name: "Torre Futura",
    address: "87 Av. Norte y Col. Escalón",
    coordinates: { lat: 13.7018, lng: -89.2268 },
    distanceMeters: 310,
    pricePerHour: 2.00,
    currency: "USD",
    facilityType: "regional",
    totalCapacity: 120,
    levels: [buildLayoutA("lot-007-level-1")],
    totalSlots: 40,
    availableSlots: 8,
    rating: 4.2,
  },
  {
    id: "lot-008",
    buildingId: "bld-008",
    name: "Plaza San Benito",
    address: "Col. San Benito, San Salvador",
    coordinates: { lat: 13.6940, lng: -89.2265 },
    distanceMeters: 760,
    pricePerHour: 1.25,
    currency: "USD",
    facilityType: "regional",
    totalCapacity: 160,
    levels: [buildLayoutA("lot-008-level-1"), buildLayoutA("lot-008-level-2")],
    totalSlots: 80,
    availableSlots: 28,
    rating: 4.1,
  },
];

export function listParkingLots(): ParkingLot[] {
  return parkingLots;
}

export function getParkingLotById(id: string): ParkingLot | undefined {
  return parkingLots.find((lot) => lot.id === id);
}

export function getNearbyParkingLots(maxDistance: number = 1000): ParkingLot[] {
  return parkingLots
    .filter((lot) => lot.distanceMeters <= maxDistance)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function getRecommendedLots(): ParkingLot[] {
  // Priority: 1. Available slots, 2. Proximity, 3. Price
  return [...parkingLots].sort((a, b) => {
    // First: sort by availability (more available = better)
    const availabilityA = a.availableSlots / a.totalSlots;
    const availabilityB = b.availableSlots / b.totalSlots;
    if (availabilityA !== availabilityB) {
      return availabilityB - availabilityA; // Higher availability first
    }
    
    // Second: sort by distance (closer = better)
    if (a.distanceMeters !== b.distanceMeters) {
      return a.distanceMeters - b.distanceMeters;
    }
    
    // Third: sort by price (cheaper = better)
    return a.pricePerHour - b.pricePerHour;
  });
}

export function getCheapestLots(): ParkingLot[] {
  return [...parkingLots].sort((a, b) => a.pricePerHour - b.pricePerHour);
}
