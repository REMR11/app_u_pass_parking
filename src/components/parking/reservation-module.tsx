"use client";

import { useState, useEffect, useCallback } from "react";
import type { ParkingSlot, ParkingLevel, ParkingLot, Coordinates } from "@/domain/parking/types";

type ReservationStep = "preview" | "pre-reserve" | "confirm" | "payment" | "success";

interface ReservationModuleProps {
  slot: ParkingSlot;
  level: ParkingLevel;
  lot: ParkingLot;
  userLocation: Coordinates | null;
  onClose: () => void;
  onComplete: (reservationId: string) => void;
}

// Calculate distance between two coordinates in meters
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Icons
function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// Pre-reservation timer component
function PreReservationTimer({ 
  expiresAt, 
  onExpired 
}: { 
  expiresAt: Date; 
  onExpired: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        onExpired();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLow = timeLeft <= 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
      isLow ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
    }`}>
      <ClockIcon className="w-5 h-5" />
      <span className="font-bold text-lg tabular-nums">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
      <span className="text-sm opacity-80">restantes</span>
    </div>
  );
}

// Location validation component
function LocationValidator({
  userLocation,
  lotLocation,
  maxDistance = 500, // 500 meters default
  onValidationChange,
}: {
  userLocation: Coordinates | null;
  lotLocation: Coordinates;
  maxDistance?: number;
  onValidationChange: (isValid: boolean, distance: number | null) => void;
}) {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(userLocation);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationError("Tu dispositivo no soporta geolocalización");
      onValidationChange(false, null);
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(newLocation);
        const distance = calculateDistance(newLocation, lotLocation);
        const isValid = distance <= maxDistance;
        onValidationChange(isValid, distance);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Permiso de ubicación denegado. Activa los permisos en configuración.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Ubicación no disponible. Verifica tu conexión GPS.");
            break;
          case error.TIMEOUT:
            setLocationError("Tiempo de espera agotado. Intenta de nuevo.");
            break;
          default:
            setLocationError("Error al obtener ubicación");
        }
        onValidationChange(false, null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [lotLocation, maxDistance, onValidationChange]);

  useEffect(() => {
    if (currentLocation) {
      const distance = calculateDistance(currentLocation, lotLocation);
      onValidationChange(distance <= maxDistance, distance);
    }
  }, [currentLocation, lotLocation, maxDistance, onValidationChange]);

  const distance = currentLocation ? calculateDistance(currentLocation, lotLocation) : null;
  const isValid = distance !== null && distance <= maxDistance;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <LocationIcon className="w-5 h-5 text-primary" />
          Validación de ubicación
        </h3>
        {isValid && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success bg-success/10 px-3 py-1 rounded-full">
            <CheckCircleIcon className="w-4 h-4" />
            Verificada
          </span>
        )}
      </div>

      {/* Location status card */}
      <div className={`rounded-2xl p-4 border-2 transition-colors ${
        isValid 
          ? "bg-success/5 border-success/30" 
          : distance !== null 
            ? "bg-destructive/5 border-destructive/30"
            : "bg-muted border-muted-foreground/20"
      }`}>
        {isLocating ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="font-medium text-foreground">Obteniendo ubicación...</p>
              <p className="text-sm text-muted-foreground">Esto puede tardar unos segundos</p>
            </div>
          </div>
        ) : locationError ? (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircleIcon className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-destructive">Error de ubicación</p>
              <p className="text-sm text-muted-foreground mt-0.5">{locationError}</p>
              <button
                onClick={requestLocation}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        ) : distance !== null ? (
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isValid ? "bg-success/10" : "bg-destructive/10"
            }`}>
              {isValid ? (
                <CheckCircleIcon className="w-5 h-5 text-success" />
              ) : (
                <AlertCircleIcon className="w-5 h-5 text-destructive" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isValid ? "text-success" : "text-destructive"}`}>
                {isValid ? "Estás cerca del estacionamiento" : "Estás lejos del estacionamiento"}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Distancia: {distance >= 1000 
                  ? `${(distance / 1000).toFixed(1)} km` 
                  : `${Math.round(distance)} m`}
                {!isValid && ` (máx. ${maxDistance}m permitidos)`}
              </p>
              {!isValid && (
                <p className="text-sm text-muted-foreground mt-2">
                  Debes estar dentro de {maxDistance}m del estacionamiento para confirmar la reserva.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <LocationIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Ubicación requerida</p>
              <p className="text-sm text-muted-foreground">
                Valida tu ubicación para confirmar la reserva
              </p>
            </div>
            <button
              onClick={requestLocation}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm active:scale-95 transition-transform"
            >
              Validar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mini slot preview visualization
function SlotPreview({ slot, level, lot }: { slot: ParkingSlot; level: ParkingLevel; lot: ParkingLot }) {
  return (
    <div className="bg-muted/50 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {lot.name}
          </p>
          <p className="text-sm font-medium text-foreground">{level.name} - {level.aisle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-success">Disponible</span>
        </div>
      </div>

      {/* Visual slot representation */}
      <div className="relative bg-foreground/5 rounded-xl p-6 mb-4">
        {/* Parking lines */}
        <div className="absolute inset-x-4 top-4 h-1 bg-primary/20 rounded" />
        <div className="absolute inset-x-4 bottom-4 h-1 bg-primary/20 rounded" />
        
        {/* Slot box */}
        <div className="relative mx-auto w-32 h-20 border-4 border-primary border-dashed rounded-xl bg-primary/5 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-black text-primary">{slot.code}</p>
            {slot.category !== "standard" && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                slot.category === "accessible" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {slot.category === "accessible" ? "♿ Accesible" : "🧓 Adulto mayor"}
              </span>
            )}
          </div>
        </div>

        {/* Car icon approaching */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <CarIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Slot details */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-background rounded-xl p-2">
          <p className="text-xs text-muted-foreground">Tarifa</p>
          <p className="font-bold text-foreground">${lot.pricePerHour.toFixed(2)}/hr</p>
        </div>
        <div className="bg-background rounded-xl p-2">
          <p className="text-xs text-muted-foreground">Proximidad</p>
          <p className="font-bold text-foreground">
            {slot.entranceProximity <= 3 ? "Cerca" : slot.entranceProximity <= 6 ? "Media" : "Lejos"}
          </p>
        </div>
        <div className="bg-background rounded-xl p-2">
          <p className="text-xs text-muted-foreground">Fila</p>
          <p className="font-bold text-foreground">{slot.row}</p>
        </div>
      </div>
    </div>
  );
}

// Payment method selector
function PaymentMethodSelector({
  selectedMethod,
  onSelect,
}: {
  selectedMethod: string | null;
  onSelect: (method: string) => void;
}) {
  const methods = [
    { id: "card", name: "Tarjeta de crédito/débito", icon: "💳" },
    { id: "apple", name: "Apple Pay", icon: "🍎" },
    { id: "google", name: "Google Pay", icon: "🔵" },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <CreditCardIcon className="w-5 h-5 text-primary" />
        Método de pago
      </h3>
      <div className="space-y-2">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              selectedMethod === method.id
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/20 bg-background hover:border-primary/50"
            }`}
          >
            <span className="text-2xl">{method.icon}</span>
            <span className="font-medium text-foreground flex-1 text-left">{method.name}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground/30"
            }`}>
              {selectedMethod === method.id && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReservationModule({
  slot,
  level,
  lot,
  userLocation,
  onClose,
  onComplete,
}: ReservationModuleProps) {
  const [step, setStep] = useState<ReservationStep>("preview");
  const [isLocationValid, setIsLocationValid] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [preReservationExpiry, setPreReservationExpiry] = useState<Date | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedHours, setSelectedHours] = useState(1);

  // Pre-reservation duration (5 minutes)
  const PRE_RESERVATION_MINUTES = 5;
  // Max distance for location validation (500 meters)
  const MAX_VALIDATION_DISTANCE = 500;

  const handleLocationValidation = useCallback((valid: boolean, dist: number | null) => {
    setIsLocationValid(valid);
    setDistance(dist);
  }, []);

  const handlePreReserve = () => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + PRE_RESERVATION_MINUTES);
    setPreReservationExpiry(expiry);
    setStep("pre-reserve");
  };

  const handlePreReservationExpired = () => {
    setPreReservationExpiry(null);
    setStep("preview");
    // Could show a toast or alert here
  };

  const handleConfirm = () => {
    setStep("confirm");
  };

  const handleProceedToPayment = () => {
    if (!isLocationValid) return;
    setStep("payment");
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setStep("success");
    
    // Generate reservation ID
    const reservationId = `RES-${Date.now()}-${slot.code}`;
    
    // Notify parent after a delay
    setTimeout(() => {
      onComplete(reservationId);
    }, 3000);
  };

  const totalPrice = lot.pricePerHour * selectedHours;

  const goBack = () => {
    switch (step) {
      case "pre-reserve":
        setPreReservationExpiry(null);
        setStep("preview");
        break;
      case "confirm":
        setStep("pre-reserve");
        break;
      case "payment":
        setStep("confirm");
        break;
      default:
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 bg-primary text-primary-foreground px-4 pt-safe">
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors"
            aria-label="Volver"
          >
            {step === "preview" ? (
              <XIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">
              {step === "preview" && "Reservar espacio"}
              {step === "pre-reserve" && "Pre-reserva activa"}
              {step === "confirm" && "Confirmar reserva"}
              {step === "payment" && "Realizar pago"}
              {step === "success" && "Reserva confirmada"}
            </h1>
            <p className="text-sm text-white/80">{slot.code} - {level.name}</p>
          </div>
          {preReservationExpiry && step !== "success" && (
            <PreReservationTimer 
              expiresAt={preReservationExpiry} 
              onExpired={handlePreReservationExpired}
            />
          )}
        </div>
      </header>

      {/* Progress indicator */}
      {step !== "success" && (
        <div className="flex-shrink-0 px-4 py-3 bg-muted/50">
          <div className="flex items-center gap-2">
            {["preview", "pre-reserve", "confirm", "payment"].map((s, i) => {
              const stepIndex = ["preview", "pre-reserve", "confirm", "payment"].indexOf(step);
              const isComplete = i < stepIndex;
              const isCurrent = s === step;
              
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isComplete 
                      ? "bg-success text-white" 
                      : isCurrent 
                        ? "bg-primary text-white" 
                        : "bg-muted-foreground/20 text-muted-foreground"
                  }`}>
                    {isComplete ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      isComplete ? "bg-success" : "bg-muted-foreground/20"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Vista</span>
            <span>Pre-reserva</span>
            <span>Confirmar</span>
            <span>Pago</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-6">
          
          {/* STEP: Preview */}
          {step === "preview" && (
            <>
              <SlotPreview slot={slot} level={level} lot={lot} />
              
              {/* Duration selector */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-primary" />
                  Duración estimada
                </h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => setSelectedHours(hours)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        selectedHours === hours
                          ? "bg-primary text-white shadow-lg"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Price summary */}
              <div className="bg-success/10 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-success/80">Total estimado</p>
                    <p className="text-3xl font-black text-success">
                      ${totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      ${lot.pricePerHour.toFixed(2)}/hr × {selectedHours}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl">
                <ShieldCheckIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Pre-reserva disponible</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Reserva el espacio por {PRE_RESERVATION_MINUTES} minutos mientras llegas. 
                    Confirma con tu ubicación al llegar.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* STEP: Pre-reserve */}
          {step === "pre-reserve" && (
            <>
              <SlotPreview slot={slot} level={level} lot={lot} />
              
              {/* Pre-reservation status */}
              <div className="bg-warning/10 border-2 border-warning/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Espacio pre-reservado</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      El espacio {slot.code} está reservado temporalmente para ti. 
                      Dirígete al estacionamiento para confirmar tu reserva.
                    </p>
                  </div>
                </div>
              </div>

              {/* Location validation */}
              <LocationValidator
                userLocation={userLocation}
                lotLocation={lot.coordinates}
                maxDistance={MAX_VALIDATION_DISTANCE}
                onValidationChange={handleLocationValidation}
              />

              {/* Instructions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Próximos pasos</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">1</span>
                    <span className="text-sm text-foreground">Dirígete al estacionamiento {lot.name}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">2</span>
                    <span className="text-sm text-foreground">Valida tu ubicación al llegar</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">3</span>
                    <span className="text-sm text-foreground">Confirma y paga tu reserva</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP: Confirm */}
          {step === "confirm" && (
            <>
              <SlotPreview slot={slot} level={level} lot={lot} />
              
              {/* Location validation */}
              <LocationValidator
                userLocation={userLocation}
                lotLocation={lot.coordinates}
                maxDistance={MAX_VALIDATION_DISTANCE}
                onValidationChange={handleLocationValidation}
              />

              {/* Reservation summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Resumen de reserva</h3>
                <div className="bg-muted/50 rounded-2xl divide-y divide-muted-foreground/10">
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground">Espacio</span>
                    <span className="font-semibold text-foreground">{slot.code}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground">Ubicación</span>
                    <span className="font-semibold text-foreground">{level.name}, {lot.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground">Duración</span>
                    <span className="font-semibold text-foreground">{selectedHours} hora{selectedHours > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-muted-foreground">Tarifa</span>
                    <span className="font-semibold text-foreground">${lot.pricePerHour.toFixed(2)}/hr</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-success/5">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-black text-success">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Distance info */}
              {distance !== null && (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${
                  isLocationValid ? "bg-success/10" : "bg-destructive/10"
                }`}>
                  <LocationIcon className={`w-5 h-5 ${isLocationValid ? "text-success" : "text-destructive"}`} />
                  <span className={`text-sm font-medium ${isLocationValid ? "text-success" : "text-destructive"}`}>
                    Tu ubicación: {distance >= 1000 
                      ? `${(distance / 1000).toFixed(1)} km` 
                      : `${Math.round(distance)} m`} del estacionamiento
                  </span>
                </div>
              )}
            </>
          )}

          {/* STEP: Payment */}
          {step === "payment" && (
            <>
              {/* Order summary */}
              <div className="bg-primary/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{slot.code} - {level.name}</p>
                    <p className="text-sm text-muted-foreground">{lot.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{selectedHours}h</p>
                    <p className="text-xl font-black text-primary">${totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onSelect={setSelectedPaymentMethod}
              />

              {/* Security note */}
              <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
                <ShieldCheckIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Pago seguro</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Tu información está protegida con encriptación de grado bancario.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* STEP: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6 animate-in fade-in zoom-in duration-500">
                <CheckCircleIcon className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-2">¡Reserva confirmada!</h2>
              <p className="text-muted-foreground mb-8 max-w-xs">
                Tu espacio {slot.code} en {level.name} ha sido reservado exitosamente.
              </p>
              
              {/* Reservation details card */}
              <div className="w-full bg-muted/50 rounded-2xl p-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Espacio reservado</p>
                    <p className="text-3xl font-black text-primary">{slot.code}</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                    <CarIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ubicación</span>
                    <span className="font-medium">{level.name}, {lot.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duración</span>
                    <span className="font-medium">{selectedHours} hora{selectedHours > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total pagado</span>
                    <span className="font-bold text-success">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                Redirigiendo al mapa...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      {step !== "success" && (
        <div className="flex-shrink-0 p-4 bg-background border-t border-muted" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
          {step === "preview" && (
            <button
              onClick={handlePreReserve}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform shadow-lg"
            >
              Pre-reservar espacio
            </button>
          )}

          {step === "pre-reserve" && (
            <button
              onClick={handleConfirm}
              disabled={!isLocationValid}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                isLocationValid
                  ? "bg-success text-white active:scale-[0.98] shadow-lg"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isLocationValid ? "Confirmar reserva" : "Valida tu ubicación para continuar"}
            </button>
          )}

          {step === "confirm" && (
            <button
              onClick={handleProceedToPayment}
              disabled={!isLocationValid}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                isLocationValid
                  ? "bg-primary text-white active:scale-[0.98] shadow-lg"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Proceder al pago - ${totalPrice.toFixed(2)}
            </button>
          )}

          {step === "payment" && (
            <button
              onClick={handlePayment}
              disabled={!selectedPaymentMethod || isProcessing}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                selectedPaymentMethod && !isProcessing
                  ? "bg-success text-white active:scale-[0.98] shadow-lg"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando pago...
                </>
              ) : (
                `Pagar ${totalPrice.toFixed(2)}`
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
