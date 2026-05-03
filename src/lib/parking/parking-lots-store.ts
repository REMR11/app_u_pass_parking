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

// Default center: Mexico City (Reforma area)
export const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 };

const parkingLots: ParkingLot[] = [
  {
    id: "lot-001",
    buildingId: "bld-001",
    name: "Torre Norte - Principal",
    address: "Av. Principal 100, Nivel -1",
    coordinates: { lat: 19.4340, lng: -99.1350 },
    distanceMeters: 120,
    pricePerHour: 25,
    currency: "MXN",
    levels: generateLevels("lot-001", 3),
    totalSlots: 72,
    availableSlots: 18,
    rating: 4.5,
  },
  {
    id: "lot-002",
    buildingId: "bld-001",
    name: "Torre Norte - Visitantes",
    address: "Av. Principal 100, Nivel -2",
    coordinates: { lat: 19.4335, lng: -99.1345 },
    distanceMeters: 180,
    pricePerHour: 20,
    currency: "MXN",
    levels: generateLevels("lot-002", 2),
    totalSlots: 48,
    availableSlots: 12,
    rating: 4.2,
  },
  {
    id: "lot-003",
    buildingId: "bld-002",
    name: "Edificio Central",
    address: "Calle Secundaria 45",
    coordinates: { lat: 19.4310, lng: -99.1380 },
    distanceMeters: 350,
    pricePerHour: 15,
    currency: "MXN",
    levels: generateLevels("lot-003", 2),
    totalSlots: 48,
    availableSlots: 8,
    rating: 4.0,
  },
  {
    id: "lot-004",
    buildingId: "bld-003",
    name: "Plaza Comercial Sur",
    address: "Blvd. Sur 200",
    coordinates: { lat: 19.4280, lng: -99.1300 },
    distanceMeters: 500,
    pricePerHour: 12,
    currency: "MXN",
    levels: generateLevels("lot-004", 4),
    totalSlots: 96,
    availableSlots: 35,
    rating: 4.7,
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
  // Recommendation algorithm: balance proximity and price
  return [...parkingLots].sort((a, b) => {
    const scoreA = a.distanceMeters * 0.4 + a.pricePerHour * 10 * 0.6;
    const scoreB = b.distanceMeters * 0.4 + b.pricePerHour * 10 * 0.6;
    return scoreA - scoreB;
  });
}

export function getCheapestLots(): ParkingLot[] {
  return [...parkingLots].sort((a, b) => a.pricePerHour - b.pricePerHour);
}
