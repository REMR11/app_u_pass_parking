import { randomUUID } from "crypto";
import type { PaymentIntent } from "@/domain/parking/types";

export type CreateIntentInput = {
  buildingId: string;
  amountCents: number;
  currency?: string;
};

/**
 * Stub de intención de pago móvil.
 * Aquí se conectará el PSP (Stripe Checkout, Mercado Pago, etc.) manteniendo esta firma.
 */
export async function createMobilePaymentIntent(
  input: CreateIntentInput,
): Promise<PaymentIntent> {
  const currency = input.currency ?? "USD";
  return {
    id: randomUUID(),
    amountCents: input.amountCents,
    currency,
    status: "pending",
    buildingId: input.buildingId,
    providerRef: `stub_${randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };
}
