import type { ParkingLot, ParkingSlot, ParkingLevel } from "@/domain/parking/types";

/**
 * Mock data for parking lots with slot visualization.
 * Replace with real API/database integration.
 */

function generateSlots(levelId: string, rows: number, cols: number): ParkingSlot[] {
  const slots: ParkingSlot[] = [];
  const statuses: Array<"available" | "occupied"> = ["available", "occupied"];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const isOccupied = Math.random() > 0.3;
      slots.push({
        id: `${levelId}-slot-${row}-${col}`,
        code: `${String.fromCharCode(65 + row)}-${col + 1}`,
        status: isOccupied ? "occupied" : "available",
        row,
        col,
      });
    }
  }
  return slots;
}

function generateLevels(lotId: string, count: number): ParkingLevel[] {
  const aisles = ["A", "B", "C", "D"];
  return Array.from({ length: count }, (_, i) => {
    const levelId = `${lotId}-level-${i + 1}`;
    return {
      id: levelId,
      name: `Nivel ${i + 1}`,
      aisle: `Pasillo ${aisles[i % aisles.length]}`,
      slots: generateSlots(levelId, 4, 6),
    };
  });
}

// Default center: San Salvador, El Salvador (Colonia Escalon / Zona Rosa)
export const DEFAULT_CENTER = { lat: 13.7006, lng: -89.2295 };

/**
 * Parking lots with real El Salvador capacity data.
 *
 * Large commercial centers  → totalCapacity 1,500–3,000  facilityType "large"
 * Regional / local centers  → totalCapacity  100–300     facilityType "regional"
 *
 * totalSlots in this mock represents the monitored zone displayed in-app
 * (a subset of total physical capacity for demo purposes).
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
    levels: generateLevels("lot-001", 5),
    totalSlots: 120,
    availableSlots: 48,
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
    levels: generateLevels("lot-002", 6),
    totalSlots: 140,
    availableSlots: 22,
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
    levels: generateLevels("lot-003", 4),
    totalSlots: 96,
    availableSlots: 37,
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
    levels: generateLevels("lot-004", 4),
    totalSlots: 80,
    availableSlots: 14,
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
    levels: generateLevels("lot-005", 1),
    totalSlots: 48,
    availableSlots: 11,
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
    levels: generateLevels("lot-006", 2),
    totalSlots: 60,
    availableSlots: 28,
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
    levels: generateLevels("lot-007", 2),
    totalSlots: 40,
    availableSlots: 6,
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
    levels: generateLevels("lot-008", 2),
    totalSlots: 44,
    availableSlots: 19,
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
