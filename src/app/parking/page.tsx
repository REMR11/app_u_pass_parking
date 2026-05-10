"use client";

import { ReservationFeedback } from "@/components/parking/reservation-feedback";
import { DesktopParkingView } from "@/components/parking/views/desktop-parking-view";
import { MobileParkingMapView } from "@/components/parking/views/mobile-parking-map-view";
import { ParkingSlotsView } from "@/components/parking/views/parking-slots-view";
import { useParkingExperience } from "@/hooks/use-parking-experience";

export default function ParkingPage() {
  const exp = useParkingExperience();

  const feedback = (
    <ReservationFeedback message={exp.reserveNotice} onDismiss={() => exp.setReserveNotice(null)} />
  );

  if (exp.viewMode === "slots" && exp.selectedLot) {
    return (
      <>
        {feedback}
        <ParkingSlotsView
          variant={exp.isMobile ? "mobile" : "desktop"}
          selectedLot={exp.selectedLot}
          currentLevel={exp.currentLevel}
          selectedLevelId={exp.selectedLevelId}
          onSelectLevel={exp.setSelectedLevelId}
          selectedSlot={exp.selectedSlot}
          onSelectSlot={exp.handleSelectSlot}
          onBackToMap={exp.handleBackToMap}
          onReserve={exp.handleReserve}
          onCloseSlot={() => exp.setSelectedSlot(null)}
        />
      </>
    );
  }

  return (
    <>
      {feedback}
      {exp.isMobile ? (
        <MobileParkingMapView
          mapRef={exp.mapRef}
          filteredLots={exp.filteredLots}
          userLocation={exp.userLocation}
          selectedLot={exp.selectedLot}
          onSelectLot={exp.handleSelectLot}
          mapCenter={exp.mapCenter}
          filterMode={exp.filterMode}
          availableCount={exp.availableCount}
          tenantShortName={exp.tenantShortName}
          activeFilter={exp.activeFilter}
          onFilterChange={exp.setActiveFilter}
          showLotSheet={exp.showLotSheet}
          onShowLotSheet={exp.setShowLotSheet}
          bestLot={exp.bestLot}
          onViewLotDetails={exp.handleViewLotDetails}
          isLocating={exp.isLocating}
          onCenterOnUser={exp.centerMapOnUser}
        />
      ) : (
        <DesktopParkingView
          mapRef={exp.mapRef}
          tenantShortName={exp.tenantShortName}
          searchQuery={exp.searchQuery}
          onSearchQueryChange={exp.setSearchQuery}
          activeFilter={exp.activeFilter}
          onFilterChange={exp.setActiveFilter}
          availableCount={exp.availableCount}
          filteredLots={exp.filteredLots}
          selectedLot={exp.selectedLot}
          onSelectLot={exp.handleSelectLot}
          userLocation={exp.userLocation}
          mapCenter={exp.mapCenter}
          filterMode={exp.filterMode}
          isLocating={exp.isLocating}
          onCenterOnUser={exp.centerMapOnUser}
          onViewLotDetails={exp.handleViewLotDetails}
        />
      )}
    </>
  );
}
