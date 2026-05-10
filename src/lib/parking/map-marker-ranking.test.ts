import { describe, expect, it } from "vitest";
import type { ParkingLot } from "@/domain/parking/types";
import { buildLotRankings, getPriceMarkerBackground } from "./map-marker-ranking";

function lot(partial: Partial<ParkingLot> & Pick<ParkingLot, "id">): ParkingLot {
  return {
    id: partial.id,
    name: partial.name ?? "Lote",
    address: partial.address ?? "Calle",
    coordinates: partial.coordinates ?? { lat: 0, lng: 0 },
    distanceMeters: partial.distanceMeters ?? 100,
    pricePerHour: partial.pricePerHour ?? 10,
    totalSlots: partial.totalSlots ?? 10,
    availableSlots: partial.availableSlots ?? 5,
    facilityType: partial.facilityType ?? "regional",
    rating: partial.rating ?? 4,
    levels: partial.levels ?? [],
  };
}

describe("getPriceMarkerBackground", () => {
  it("usa color de no disponible cuando no hay cupos", () => {
    const rankings = buildLotRankings([
      lot({ id: "a", availableSlots: 0, totalSlots: 10 }),
    ]);
    expect(
      getPriceMarkerBackground({
        lot: lot({ id: "a", availableSlots: 0 }),
        isSelected: false,
        filterMode: "recommended",
        rankings,
      }),
    ).toBe("var(--map-marker-unavailable)");
  });

  it("no divide entre cero cuando solo hay un lote disponible en el ranking", () => {
    const rankings = buildLotRankings([
      lot({ id: "x", availableSlots: 3, pricePerHour: 5, distanceMeters: 50 }),
      lot({ id: "y", availableSlots: 0, pricePerHour: 1, distanceMeters: 10 }),
    ]);
    expect(
      getPriceMarkerBackground({
        lot: lot({ id: "x", availableSlots: 3 }),
        isSelected: false,
        filterMode: "cheapest",
        rankings,
      }),
    ).toBe("var(--success)");
  });
});
