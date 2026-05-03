import { listBuildings } from "@/lib/parking/buildings-store";
import Link from "next/link";

export default function BuildingsPage() {
  const buildings = listBuildings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edificios</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Datos de ejemplo en memoria; sustituir por API y base de datos sin cambiar la UI.
        </p>
      </div>
      <ul className="divide-y divide-foreground/10 rounded-xl border border-foreground/10">
        {buildings.map((b) => (
          <li key={b.id} className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{b.name}</p>
              <p className="text-sm text-foreground/65">{b.address}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-foreground/70">
                ~{b.availableSlotsApprox} libres / {b.totalSlots}
              </span>
              <Link
                href={`/dashboard/payments?buildingId=${encodeURIComponent(b.id)}`}
                className="rounded-lg bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90"
              >
                Cobrar
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
