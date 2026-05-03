import Link from "next/link";
import { getTenantConfig } from "@/config/tenant";

export default function DashboardHome() {
  const tenant = getTenantConfig();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel</h1>
        <p className="mt-2 max-w-2xl text-foreground/70">
          Módulo de acceso a estacionamiento para varios edificios, con pagos desde el móvil. La
          marca actual es <strong>{tenant.appName}</strong>; en otro despliegue solo cambian
          variables de entorno y activos en <code className="rounded bg-foreground/10 px-1">public/tenant/</code>.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/buildings"
          className="rounded-xl border border-foreground/10 p-6 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <h2 className="font-medium">Edificios</h2>
          <p className="mt-2 text-sm text-foreground/65">Ver ocupación y detalle por edificio.</p>
        </Link>
        <Link
          href="/dashboard/payments"
          className="rounded-xl border border-foreground/10 p-6 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <h2 className="font-medium">Pagos móviles</h2>
          <p className="mt-2 text-sm text-foreground/65">Crear intención de pago (stub listo para PSP).</p>
        </Link>
      </div>
    </div>
  );
}
