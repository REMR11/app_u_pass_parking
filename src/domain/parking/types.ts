/** Entidades de dominio: parking multi-edificio y pagos móviles (stub evolutivo). */

export type BuildingId = string;
export type ParkingLotId = string;
export type SlotId = string;

export type SlotStatus = "available" | "occupied" | "reserved" | "selected";

export type ParkingSlot = {
  id: SlotId;
  code: string;
  status: SlotStatus;
  row: number;
  col: number;
};

export type ParkingLevel = {
  id: string;
  name: string;
  aisle: string;
  slots: ParkingSlot[];
};

export type Coordinates = {
  lat: number;
  lng: number;
};

/**
 * "large"  – centros comerciales mayores (Metrocentro, Multiplaza, etc.)
 *            Capacidad real: 1,500–3,000 vehículos, estructura multinivel.
 * "regional" – centros regionales/locales (Encuentros, Bambú, edificios)
 *            Capacidad real: 100–300 vehículos.
 */
export type FacilityType = "large" | "regional";

export type ParkingLot = {
  id: ParkingLotId;
  buildingId: BuildingId;
  name: string;
  address: string;
  coordinates: Coordinates;
  distanceMeters: number;
  pricePerHour: number;
  currency: string;
  levels: ParkingLevel[];
  /** Capacidad total real de la instalacion (aforo fisico). */
  totalCapacity: number;
  /** Tipo de instalacion que determina escala y contexto. */
  facilityType: FacilityType;
  totalSlots: number;
  availableSlots: number;
  rating: number;
};

export type Building = {
  id: BuildingId;
  name: string;
  address: string;
  /** Plazas totales (informativo en UI) */
  totalSlots: number;
  /** Plazas libres aproximadas (mock hasta integrar sensores/backend real) */
  availableSlotsApprox: number;
};

export type AccessSession = {
  id: string;
  buildingId: BuildingId;
  licensePlate: string;
  enteredAt: string;
  /** ISO; null si aún dentro */
  exitedAt: string | null;
};

export type PaymentIntentStatus = "pending" | "succeeded" | "failed";

export type PaymentIntent = {
  id: string;
  amountCents: number;
  currency: string;
  status: PaymentIntentStatus;
  buildingId: BuildingId;
  /** Referencia externa del proveedor móvil (Stripe, Mercado Pago, etc.) */
  providerRef?: string;
  createdAt: string;
};
