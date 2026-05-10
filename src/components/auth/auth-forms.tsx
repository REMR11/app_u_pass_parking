"use client";

import { signInWithEmailPassword, signUpWithEmail } from "@/app/auth/actions";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface AuthFormsProps {
  callbackUrl: string;
  errorMessage?: string;
  supabaseConfigured: boolean;
}

type AuthTab = "login" | "register";

export function AuthForms({
  callbackUrl,
  errorMessage,
  supabaseConfigured,
}: AuthFormsProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex rounded-2xl bg-muted p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "login"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("register")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "register"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Registrarse
        </button>
      </div>

      {!supabaseConfigured ? (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-center text-sm text-warning">
          Falta configurar Supabase (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`). El registro y el
          inicio de sesión no están disponibles.
        </div>
      ) : activeTab === "login" ? (
        <LoginPanel callbackUrl={callbackUrl} initialError={errorMessage} />
      ) : (
        <RegisterPanel callbackUrl={callbackUrl} onSwitchToLogin={() => setActiveTab("login")} />
      )}
    </div>
  );
}

function LoginPanel({
  callbackUrl,
  initialError,
}: {
  callbackUrl: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = useCallback((v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Ingresa un correo electrónico válido");
      return;
    }
    if (!password) {
      setError("Ingresa tu contraseña");
      return;
    }

    setError(null);
    setLoading(true);
    const result = await signInWithEmailPassword(email.trim(), password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/parking");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm font-medium text-foreground">
          Correo electrónico
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          className="w-full h-14 px-4 rounded-2xl border-2 border-foreground/10 bg-background text-foreground text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          placeholder="tu@correo.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-medium text-foreground">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            className="w-full h-14 px-4 pr-14 rounded-2xl border-2 border-foreground/10 bg-background text-foreground text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Entrando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}

function RegisterPanel({
  callbackUrl,
  onSwitchToLogin,
}: {
  callbackUrl: string;
  onSwitchToLogin: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"form" | "confirm-email">("form");
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useCallback((pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^a-zA-Z0-9]/.test(pwd)) s++;
    return s;
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signUpWithEmail(
      name.trim(),
      email.trim(),
      password,
      confirmPassword,
      acceptTerms,
    );

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setPhase("confirm-email");
      return;
    }

    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/parking");
    router.refresh();
  }

  if (phase === "confirm-email") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-foreground">Confirma tu correo</h3>
        <p className="text-sm text-muted-foreground">
          Te enviamos un enlace a <strong className="text-foreground">{email}</strong>. Ábrelo para activar la cuenta y
          luego inicia sesión.
        </p>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  const strength = passwordStrength(password);
  const strengthLabel = ["Muy débil", "Débil", "Moderada", "Fuerte", "Muy fuerte"][strength] ?? "";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label htmlFor="register-name" className="text-sm font-medium text-foreground">
          Nombre completo
        </label>
        <input
          id="register-name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-14 px-4 rounded-2xl border-2 border-foreground/10 bg-background text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          placeholder="Juan Pérez"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="register-email" className="text-sm font-medium text-foreground">
          Correo electrónico
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-14 px-4 rounded-2xl border-2 border-foreground/10 bg-background text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          placeholder="tu@correo.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="register-password" className="text-sm font-medium text-foreground">
          Contraseña
        </label>
        <input
          id="register-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-14 px-4 rounded-2xl border-2 border-foreground/10 bg-background text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          placeholder="Mínimo 8 caracteres"
        />
        {password ? (
          <p className="text-xs text-muted-foreground">
            Seguridad: <span className="font-medium">{strengthLabel}</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="register-confirm" className="text-sm font-medium text-foreground">
          Confirmar contraseña
        </label>
        <input
          id="register-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full h-14 px-4 rounded-2xl border-2 border-foreground/10 bg-background text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 rounded border-foreground/20"
        />
        <span className="text-sm text-muted-foreground">
          Acepto los términos y la política de privacidad del servicio.
        </span>
      </label>

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-xs text-primary font-medium self-start"
      >
        {showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
      </button>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
      >
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
