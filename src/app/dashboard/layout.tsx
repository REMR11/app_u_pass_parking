import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-lg border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5"
      >
        Cerrar sesión
      </button>
    </form>
  );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <AppShell
      nav={
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-foreground/70 sm:inline">{session.user.email}</span>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/dashboard" className="hover:underline">
              Resumen
            </Link>
            <Link href="/dashboard/buildings" className="hover:underline">
              Edificios
            </Link>
            <Link href="/dashboard/payments" className="hover:underline">
              Pagos móviles
            </Link>
          </nav>
          <SignOutButton />
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
