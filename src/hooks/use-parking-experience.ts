"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ParkingSlot, ParkingLot, Coordinates } from "@/domain/parking/types";
import {
  getNearbyParkingLots,
  getRecommendedLots,
  getCheapestLots,
  DEFAULT_CENTER,
} from "@/lib/parking/parking-lots-store";
import type { ParkingMapFilterMode } from "@/lib/parking/map-filter-mode";
import type { ParkingMapHandle } from "@/components/parking/parking-map";
import type { FilterType } from "@/components/parking/filter-tabs";
import { getTenantConfig } from "@/config/tenant";

type ViewMode = "map" | "slots";

const NOTICE_MS = 4200;

function mapFilterMode(activeFilter: FilterType): ParkingMapFilterMode {
  switch (activeFilter) {
    case "nearest":
      return "nearby";
    case "cheapest":
      return "cheapest";
    default:
      return "recommended";
  }
}

export function useParkingExperience() {
  const tenantShortName = getTenantConfig().shortName;

  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [activeFilter, setActiveFilter] = useState<FilterType>("recommended");
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLotSheet, setShowLotSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reserveNotice, setReserveNotice] = useState<string | null>(null);

  const mapRef = useRef<ParkingMapHandle | null>(null);
  const reserveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setUserLocation(DEFAULT_CENTER);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const filteredLots = useMemo(() => {
    let lots: ParkingLot[];
    switch (activeFilter) {
      case "nearest":
        lots = getNearbyParkingLots();
        break;
      case "cheapest":
        lots = getCheapestLots();
        break;
      case "recommended":
      default:
        lots = getRecommendedLots();
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      lots = lots.filter(
        (lot) =>
          lot.name.toLowerCase().includes(query) || lot.address.toLowerCase().includes(query),
      );
    }

    return lots;
  }, [activeFilter, searchQuery]);

  const topLot = filteredLots[0];
  const bestLot = topLot;
  const availableCount = filteredLots.filter((l) => l.availableSlots > 0).length;
  const mapCenter = userLocation ?? DEFAULT_CENTER;
  const filterMode = mapFilterMode(activeFilter);

  const currentLevel = useMemo(() => {
    if (!selectedLot || !selectedLevelId) return null;
    return selectedLot.levels.find((l) => l.id === selectedLevelId) ?? null;
  }, [selectedLot, selectedLevelId]);

  useEffect(() => {
    if (viewMode !== "map") return;
    const top = filteredLots[0];
    if (!top) return;
    setSelectedLot(top);
    setShowLotSheet(false);
  }, [viewMode, filteredLots]);

  const clearReserveNoticeSoon = useCallback(() => {
    if (reserveTimerRef.current) clearTimeout(reserveTimerRef.current);
    reserveTimerRef.current = setTimeout(() => {
      setReserveNotice(null);
      reserveTimerRef.current = null;
    }, NOTICE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (reserveTimerRef.current) clearTimeout(reserveTimerRef.current);
    };
  }, []);

  const handleSelectLot = useCallback(
    (lot: ParkingLot) => {
      setSelectedLot(lot);
      if (isMobile) setShowLotSheet(true);
    },
    [isMobile],
  );

  const handleViewLotDetails = useCallback((lot: ParkingLot) => {
    setSelectedLot(lot);
    setSelectedLevelId(lot.levels[0]?.id ?? null);
    setViewMode("slots");
    setSelectedSlot(null);
    setShowLotSheet(false);
  }, []);

  const handleBackToMap = useCallback(() => {
    setViewMode("map");
    setSelectedLevelId(null);
    setSelectedSlot(null);
  }, []);

  const handleSelectSlot = useCallback((slot: ParkingSlot) => {
    if (slot.status === "available") setSelectedSlot(slot);
  }, []);

  const handleReserve = useCallback(() => {
    if (!selectedSlot || !selectedLot) return;
    setReserveNotice(`Reserva solicitada: ${selectedSlot.code} en ${selectedLot.name}`);
    clearReserveNoticeSoon();
  }, [selectedSlot, selectedLot, clearReserveNoticeSoon]);

  const centerMapOnUser = useCallback(() => {
    if (userLocation) mapRef.current?.centerOn(userLocation, 15);
  }, [userLocation]);

  return {
    tenantShortName,
    mapRef,
    viewMode,
    activeFilter,
    setActiveFilter,
    selectedLot,
    selectedLevelId,
    setSelectedLevelId,
    selectedSlot,
    setSelectedSlot,
    userLocation,
    isLocating,
    showLotSheet,
    setShowLotSheet,
    isMobile,
    searchQuery,
    setSearchQuery,
    filteredLots,
    bestLot,
    availableCount,
    mapCenter,
    filterMode,
    currentLevel,
    reserveNotice,
    setReserveNotice,
    handleSelectLot,
    handleViewLotDetails,
    handleBackToMap,
    handleSelectSlot,
    handleReserve,
    centerMapOnUser,
  };
}
