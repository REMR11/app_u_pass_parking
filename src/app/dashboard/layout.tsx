import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import Link from "next/link";
import { TenantLogo } from "@/components/tenant/tenant-logo";
import { getTenantConfig } from "@/config/tenant";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const tenant = getTenantConfig();

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Mobile header */}
      <header className="border-b border-foreground/10 bg-background/95 backdrop-blur-sm sticky top-0 z-10 lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/parking" className="flex items-center gap-2 text-foreground">
            <TenantLogo className="h-8 w-auto" />
            <span className="font-semibold">{tenant.shortName}</span>
          </Link>
        </div>
      </header>

      {/* Desktop header - hidden on mobile */}
      <header className="hidden lg:block border-b border-foreground/10 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/parking" className="flex items-center gap-3 font-semibold tracking-tight">
            <TenantLogo className="h-8 w-auto" />
            <span>{tenant.shortName}</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground/70">{session.user.email}</span>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/parking" className="hover:underline">
                Mapa
              </Link>
              <Link href="/dashboard" className="hover:underline">
                Perfil
              </Link>
              <Link href="/dashboard/buildings" className="hover:underline">
                Edificios
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-2xl lg:max-w-6xl px-4 py-6 sm:px-6 pb-24 lg:pb-6">
        {children}
      </main>

      {/* Bottom nav for mobile */}
      <BottomNav />
    </div>
  );
}
