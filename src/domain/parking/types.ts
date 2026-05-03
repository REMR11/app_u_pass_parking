/** Entidades de dominio: parking multi-edificio y pagos móviles (stub evolutivo). */

export type BuildingId = string;
export type ParkingLotId = string;
export type SlotId = string;

export type SlotStatus = "available" | "occupied" | "reserved" | "selected";

/**
 * "standard"    – espacio normal
 * "accessible"  – personas con discapacidad (señalización internacional)
 * "elderly"     – adultos mayores, siempre cerca de accesos
 */
export type SlotCategory = "standard" | "accessible" | "elderly";

export type ParkingSlot = {
  id: SlotId;
  code: string;
  status: SlotStatus;
  category: SlotCategory;
  /** Row index used for aisle grouping and mini-map Y position */
  row: number;
  /** Column index used for mini-map X position */
  col: number;
  /** Proximity to the nearest entrance: 1 = closest, higher = farther */
  entranceProximity: number;
};

/**
 * Mini-map cell types for the floor-plan SVG grid.
 * "slot"     – a parkable space
 * "road"     – driving lane
 * "wall"     – structural wall / pillar
 * "entrance" – entry/exit point
 * "empty"    – outside the building footprint
 */
export type CellType = "slot" | "road" | "wall" | "entrance" | "empty";

export type FloorPlanCell = {
  type: CellType;
  /** If type === "slot", links back to ParkingSlot.id */
  slotId?: SlotId;
  /** Marks entrance cells with a label like "E1" */
  label?: string;
};

export type ParkingLevel = {
  id: string;
  name: string;
  aisle: string;
  slots: ParkingSlot[];
  /** Pre-designed floor plan grid [rows][cols] */
  floorPlan: FloorPlanCell[][];
  /** Grid dimensions helper */
  gridCols: number;
  gridRows: number;
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
