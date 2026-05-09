import { auth, isCredentialsLoginAvailable, isMicrosoftEntraLoginAvailable } from "@/auth";
import { redirect } from "next/navigation";
import { MobileLoginForm } from "@/components/auth/mobile-login-form";
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
    <div className="min-h-dvh bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      {/* Top section with branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-safe">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo and branding */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                <TenantLogo className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {tenant.shortName}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Estacionamiento inteligente
              </p>
            </div>
          </div>

          {/* Login form card */}
          <div className="bg-white dark:bg-foreground/5 rounded-3xl shadow-xl shadow-black/5 border border-foreground/5 p-6">
            <MobileLoginForm
              callbackUrl={params.callbackUrl ?? "/parking"}
              showMicrosoftLogin={showMicrosoftLogin}
              showCredentialsLogin={showCredentialsLogin}
              errorMessage={params.error === "CredentialsSignin" ? "Credenciales invalidas" : undefined}
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
        </div>
      </div>

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
