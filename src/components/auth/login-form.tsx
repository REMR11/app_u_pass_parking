"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  callbackUrl,
  showMicrosoftLogin,
  showCredentialsLogin = true,
}: {
  callbackUrl?: string;
  showMicrosoftLogin?: boolean;
  showCredentialsLogin?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: callbackUrl ?? "/parking",
    });
    setLoading(false);
    if (res?.error) {
      setError("Credenciales inválidas o cuenta no configurada.");
      return;
    }
    if (res?.url) {
      router.push(res.url);
      router.refresh();
    }
  }

  async function onMicrosoftSignIn() {
    setError(null);
    setMsLoading(true);
    await signIn("microsoft-entra-id", { callbackUrl: callbackUrl ?? "/parking" });
    setMsLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {showMicrosoftLogin ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onMicrosoftSignIn}
            disabled={msLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-foreground/15 bg-background px-4 text-sm font-medium hover:bg-foreground/5 disabled:opacity-50"
          >
            {msLoading ? "Redirigiendo…" : "Continuar con Microsoft"}
          </button>
          {showCredentialsLogin ? (
            <p className="text-center text-xs text-foreground/55">o con correo y contraseña</p>
          ) : null}
        </div>
      ) : null}
      {showCredentialsLogin ? (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Correo</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2 outline-none ring-primary/40 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2 outline-none ring-primary/40 focus:ring-2"
            />
          </label>
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar con correo"}
          </button>
        </form>
      ) : !showMicrosoftLogin ? (
        <p className="text-sm text-foreground/70">
          No hay proveedores de inicio de sesión configurados. Define variables de Entra ID o credenciales demo en{" "}
          <code className="rounded bg-foreground/10 px-1">.env.local</code>.
        </p>
      ) : null}
    </div>
  );
}
