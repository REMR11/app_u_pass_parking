import Link from "next/link";
import { TenantLogo } from "@/components/tenant/tenant-logo";
import { getTenantConfig } from "@/config/tenant";

export function AppShell({
  children,
  nav,
}: {
  children: React.ReactNode;
  nav?: React.ReactNode;
}) {
  const tenant = getTenantConfig();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-foreground/10 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <TenantLogo className="h-8 w-auto" />
            <span className="hidden sm:inline">{tenant.shortName}</span>
          </Link>
          {nav}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-foreground/10 py-6 text-center text-sm text-foreground/60">
        {tenant.appName} · {tenant.supportEmail}
      </footer>
    </div>
  );
}
