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

// Default center: San Salvador, El Salvador (Zona Rosa area)
export const DEFAULT_CENTER = { lat: 13.6989, lng: -89.2245 };

const parkingLots: ParkingLot[] = [
  {
    id: "lot-001",
    buildingId: "bld-001",
    name: "Multiplaza Parking",
    address: "Centro Comercial Multiplaza, Nivel -1",
    coordinates: { lat: 13.6985, lng: -89.2320 },
    distanceMeters: 120,
    pricePerHour: 1.50,
    currency: "USD",
    levels: generateLevels("lot-001", 3),
    totalSlots: 72,
    availableSlots: 18,
    rating: 4.5,
  },
  {
    id: "lot-002",
    buildingId: "bld-001",
    name: "Torre Futura",
    address: "Colonia Escalon, 87 Av. Norte",
    coordinates: { lat: 13.7015, lng: -89.2280 },
    distanceMeters: 180,
    pricePerHour: 2.00,
    currency: "USD",
    levels: generateLevels("lot-002", 2),
    totalSlots: 48,
    availableSlots: 12,
    rating: 4.2,
  },
  {
    id: "lot-003",
    buildingId: "bld-002",
    name: "Galerias Escalon",
    address: "Paseo General Escalon",
    coordinates: { lat: 13.6960, lng: -89.2380 },
    distanceMeters: 350,
    pricePerHour: 0.75,
    currency: "USD",
    levels: generateLevels("lot-003", 2),
    totalSlots: 48,
    availableSlots: 8,
    rating: 4.0,
  },
  {
    id: "lot-004",
    buildingId: "bld-003",
    name: "La Gran Via",
    address: "Carretera Panamericana",
    coordinates: { lat: 13.6750, lng: -89.2450 },
    distanceMeters: 500,
    pricePerHour: 1.00,
    currency: "USD",
    levels: generateLevels("lot-004", 4),
    totalSlots: 96,
    availableSlots: 35,
    rating: 4.7,
  },
  {
    id: "lot-005",
    buildingId: "bld-004",
    name: "Metrocentro",
    address: "Boulevard de Los Heroes",
    coordinates: { lat: 13.7120, lng: -89.2100 },
    distanceMeters: 650,
    pricePerHour: 0.50,
    currency: "USD",
    levels: generateLevels("lot-005", 3),
    totalSlots: 120,
    availableSlots: 45,
    rating: 4.3,
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
