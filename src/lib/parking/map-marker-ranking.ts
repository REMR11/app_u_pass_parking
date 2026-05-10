import type { ParkingLot } from "@/domain/parking/types";
import type { ParkingMapFilterMode } from "./map-filter-mode";

export function buildLotRankings(lots: ParkingLot[]) {
  const byAvailability = [...lots].sort(
    (a, b) => b.availableSlots / b.totalSlots - a.availableSlots / a.totalSlots,
  );
  const byDistance = [...lots].sort((a, b) => a.distanceMeters - b.distanceMeters);
  const byPrice = [...lots].sort((a, b) => a.pricePerHour - b.pricePerHour);
  return { byAvailability, byDistance, byPrice };
}

export function getPriceMarkerBackground(args: {
  lot: ParkingLot;
  isSelected: boolean;
  filterMode: ParkingMapFilterMode;
  rankings: ReturnType<typeof buildLotRankings>;
}): string {
  const { lot, isSelected, filterMode, rankings } = args;

  if (lot.availableSlots <= 0) {
    return "var(--map-marker-unavailable)";
  }
  if (isSelected) {
    return "var(--primary)";
  }

  let rankingList: ParkingLot[];
  switch (filterMode) {
    case "nearby":
      rankingList = rankings.byDistance;
      break;
    case "cheapest":
      rankingList = rankings.byPrice;
      break;
    default:
      rankingList = rankings.byAvailability;
  }

  const availableRanked = rankingList.filter((l) => l.availableSlots > 0);
  const rank = availableRanked.findIndex((l) => l.id === lot.id);
  const n = availableRanked.length;

  if (rank < 0 || n === 0) {
    return "var(--map-marker-unavailable)";
  }
  if (n === 1) {
    return "var(--success)";
  }

  const percentile = rank / (n - 1);

  if (percentile <= 0.25) return "var(--success)";
  if (percentile <= 0.5) return "var(--map-marker-tier-lime)";
  if (percentile <= 0.75) return "var(--warning)";
  return "var(--map-marker-tier-orange)";
}
