import Link from "next/link";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { TenantLogo } from "@/components/tenant/tenant-logo";
import { getTenantConfig } from "@/config/tenant";

export default async function Home() {
  const session = await auth();
  const tenant = getTenantConfig();

  return (
    <AppShell
      nav={
        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90"
            >
              Ir al panel
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      }
    >
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Parking multi-edificio</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Acceso y cobro móvil para estacionamientos corporativos
          </h1>
          <p className="max-w-xl text-foreground/75">
            {tenant.appName} es un módulo inicial pensado para replicarse por empresa: marca, logo y
            textos se configuran por entorno; la interfaz y el backend siguen una estructura clara
            para evolucionar hacia sensores, barreras y pasarelas de pago reales.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={session ? "/dashboard" : "/login"}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {session ? "Abrir panel" : "Acceder"}
            </Link>
            <Link
              href="/dashboard/buildings"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-foreground/15 px-5 text-sm font-medium hover:bg-foreground/5"
            >
              Ver edificios (requiere sesión)
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-8">
          <div className="mb-6 flex justify-center">
            <TenantLogo className="h-10 w-auto" />
          </div>
          <ul className="space-y-4 text-sm text-foreground/80">
            <li className="flex gap-2">
              <span className="text-primary">✓</span>
              <span>Login con NextAuth (credenciales demo vía env).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">✓</span>
              <span>Rutas protegidas con middleware para panel y API.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">✓</span>
              <span>Capa de dominio y stores intercambiables por base de datos.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">✓</span>
              <span>Endpoint de intención de pago listo para integrar PSP móvil.</span>
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
