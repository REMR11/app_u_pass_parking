"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: callbackUrl ?? "/dashboard",
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

  return (
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
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
