import { auth, isCredentialsLoginAvailable, isMicrosoftEntraLoginAvailable } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  if (session?.user) {
    redirect(params.callbackUrl ?? "/dashboard");
  }

  const showMicrosoftLogin = isMicrosoftEntraLoginAvailable();
  const showCredentialsLogin = isCredentialsLoginAvailable();

  return (
    <AppShell
      nav={
        <Link href="/" className="text-sm text-foreground/70 hover:text-foreground">
          Inicio
        </Link>
      }
    >
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Accede al panel de edificios y pagos de estacionamiento.
        </p>
        <div className="mt-8 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6">
          <LoginForm
            callbackUrl={params.callbackUrl}
            showMicrosoftLogin={showMicrosoftLogin}
            showCredentialsLogin={showCredentialsLogin}
          />
        </div>
      </div>
    </AppShell>
  );
}
