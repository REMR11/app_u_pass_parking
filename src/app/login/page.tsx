import { auth, isCredentialsLoginAvailable, isMicrosoftEntraLoginAvailable } from "@/auth";
import { redirect } from "next/navigation";
import { AuthForms } from "@/components/auth/auth-forms";
import { getTenantConfig } from "@/config/tenant";
import { TenantLogo } from "@/components/tenant/tenant-logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  
  // If already logged in, redirect to parking (map view)
  if (session?.user) {
    redirect(params.callbackUrl ?? "/parking");
  }

  const showMicrosoftLogin = isMicrosoftEntraLoginAvailable();
  const showCredentialsLogin = isCredentialsLoginAvailable();
  const tenant = getTenantConfig();

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header with branding */}
      <header className="flex items-center justify-between px-6 py-4 pt-safe">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <TenantLogo className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">{tenant.shortName}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-balance">
              Bienvenido a {tenant.shortName}
            </h1>
            <p className="text-base text-muted-foreground">
              Estacionamiento inteligente para tu universidad
            </p>
          </div>

          {/* Auth forms card */}
          <div className="bg-muted/30 rounded-3xl border border-foreground/5 p-6 md:p-8">
            <AuthForms
              callbackUrl={params.callbackUrl ?? "/parking"}
              showMicrosoftLogin={showMicrosoftLogin}
              showCredentialsLogin={showCredentialsLogin}
              errorMessage={params.error === "CredentialsSignin" ? "Credenciales inválidas" : undefined}
            />
          </div>

          {/* Help text */}
          {!showMicrosoftLogin && !showCredentialsLogin && (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4">
              <p className="text-sm text-warning text-center">
                No hay proveedores de login configurados. Contacta al administrador.
              </p>
            </div>
          )}

          {/* Features highlights */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Mapa en vivo</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Disponibilidad</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Tiempo real</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center pb-safe">
        <p className="text-xs text-muted-foreground">
          {tenant.appName}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {tenant.supportEmail}
        </p>
      </footer>
    </div>
  );
}
