import { NextResponse } from "next/server";
import { z } from "zod";
import { createMobilePaymentIntent } from "@/lib/payments/mobile-intent";
import { getBuildingById } from "@/lib/parking/buildings-store";

const bodySchema = z.object({
  buildingId: z.string().min(1),
  amountCents: z.number().int().positive().max(1_000_000),
  currency: z.string().length(3).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const building = getBuildingById(parsed.data.buildingId);
  if (!building) {
    return NextResponse.json({ error: "Edificio no encontrado" }, { status: 404 });
  }

  const intent = await createMobilePaymentIntent(parsed.data);
  return NextResponse.json({ data: intent }, { status: 201 });
}
