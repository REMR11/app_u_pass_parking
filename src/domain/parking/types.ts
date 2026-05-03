/** Entidades de dominio: parking multi-edificio y pagos móviles (stub evolutivo). */

export type BuildingId = string;

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
