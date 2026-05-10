import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";
import { getTenantConfig } from "@/config/tenant";
import { getSessionUser, getUserDisplayName } from "@/lib/auth/session";

function SignOutButton() {
  return (
    <form action={signOutAction} className="w-full">
      <button
        type="submit"
        className="w-full py-4 rounded-2xl border-2 border-destructive/20 text-destructive font-semibold text-base transition-all active:scale-[0.98] hover:bg-destructive/5"
      >
        Cerrar sesión
      </button>
    </form>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6" />
    </svg>
  );
}

export default async function DashboardHome() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = getTenantConfig();
  const displayName = getUserDisplayName(user);
  const initial = displayName[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center gap-4 p-4 lg:p-0 -mx-4 lg:mx-0 bg-primary/5 lg:bg-transparent rounded-b-3xl lg:rounded-none">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-white">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{displayName}</h1>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Acciones rápidas
        </h2>
        <div className="space-y-2">
          <Link
            href="/parking"
            className="flex items-center gap-4 p-4 rounded-2xl border border-foreground/10 bg-white dark:bg-foreground/5 transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Buscar estacionamiento</h3>
              <p className="text-sm text-muted-foreground">Ver mapa y lugares disponibles</p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </Link>

          <Link
            href="/parking/reservations"
            className="flex items-center gap-4 p-4 rounded-2xl border border-foreground/10 bg-white dark:bg-foreground/5 transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Mis reservas</h3>
              <p className="text-sm text-muted-foreground">Ver historial y reservas activas</p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </Link>

          <Link
            href="/dashboard/payments"
            className="flex items-center gap-4 p-4 rounded-2xl border border-foreground/10 bg-white dark:bg-foreground/5 transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Métodos de pago</h3>
              <p className="text-sm text-muted-foreground">Gestionar pagos móviles</p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </Link>
        </div>
      </div>

      <div className="space-y-3 hidden lg:block">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Administración
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/buildings"
            className="rounded-xl border border-foreground/10 p-6 transition hover:border-primary/40 hover:bg-primary/5"
          >
            <h3 className="font-medium">Edificios</h3>
            <p className="mt-2 text-sm text-foreground/65">Ver ocupación y detalle por edificio.</p>
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Información
        </h2>
        <div className="p-4 rounded-2xl bg-muted/50 border border-foreground/5">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{tenant.appName}</strong> — Estacionamiento inteligente para edificios
            corporativos.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">Soporte: {tenant.supportEmail}</p>
        </div>
      </div>

      <div className="pt-4">
        <SignOutButton />
      </div>
    </div>
  );
}
