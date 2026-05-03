import { PaymentIntentForm } from "@/components/payments/payment-intent-form";
import { listBuildings } from "@/lib/parking/buildings-store";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ buildingId?: string }>;
}) {
  const params = await searchParams;
  const buildings = listBuildings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pagos móviles</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Crea una intención de pago (stub). Conecta aquí tu proveedor de pagos manteniendo el
          contrato de la API.
        </p>
      </div>
      <PaymentIntentForm buildings={buildings} initialBuildingId={params.buildingId} />
    </div>
  );
}
