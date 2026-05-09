"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

interface MobileLoginFormProps {
  callbackUrl: string;
  showMicrosoftLogin?: boolean;
  showCredentialsLogin?: boolean;
  errorMessage?: string;
}

export function MobileLoginForm({
  callbackUrl,
  showMicrosoftLogin,
  showCredentialsLogin = true,
  errorMessage,
}: MobileLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(errorMessage ?? null);
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email validation
  const isValidEmail = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  // Form validation
  const isFormValid = email.trim() !== "" && password.trim() !== "" && isValidEmail(email);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Client-side validation
    if (!email.trim()) {
      setError("Ingresa tu correo electronico");
      return;
    }
    
    if (!isValidEmail(email)) {
      setError("Ingresa un correo electronico valido");
      return;
    }
    
    if (!password.trim()) {
      setError("Ingresa tu contrasena");
      return;
    }
    
    if (password.length < 4) {
      setError("La contrasena debe tener al menos 4 caracteres");
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });
      
      setLoading(false);
      
      if (res?.error) {
        setError("Credenciales invalidas. Verifica tu correo y contrasena.");
        return;
      }
      
      if (res?.url) {
        router.push(res.url);
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("Error de conexion. Intenta nuevamente.");
    }
  }

  async function onMicrosoftSignIn() {
    setError(null);
    setMsLoading(true);
    try {
      await signIn("microsoft-entra-id", { callbackUrl });
    } catch {
      setMsLoading(false);
      setError("Error al conectar con Microsoft");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Microsoft login button */}
      {showMicrosoftLogin && (
        <>
          <button
            type="button"
            onClick={onMicrosoftSignIn}
            disabled={msLoading}
            className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl border-2 border-foreground/10 bg-background text-foreground font-semibold text-base transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/30 hover:bg-primary/5"
          >
            {msLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                <span>Continuar con Microsoft</span>
              </>
            )}
          </button>
          
          {showCredentialsLogin && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-foreground/10" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                o con correo
              </span>
              <div className="flex-1 h-px bg-foreground/10" />
            </div>
          )}
        </>
      )}

      {/* Credentials login form */}
      {showCredentialsLogin && (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Email input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo electronico
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="tu@correo.com"
                className="w-full h-14 px-4 rounded-2xl border-2 border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground/60 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              {email && isValidEmail(email) && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Contrasena
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Tu contrasena"
                className="w-full h-14 px-4 pr-14 rounded-2xl border-2 border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground/60 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <svg className="w-5 h-5 text-destructive flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full h-14 mt-2 rounded-2xl bg-primary text-primary-foreground font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Entrando...
              </span>
            ) : (
              "Iniciar sesion"
            )}
          </button>
        </form>
      )}

      {/* No providers configured */}
      {!showMicrosoftLogin && !showCredentialsLogin && (
        <p className="text-sm text-center text-muted-foreground">
          No hay metodos de inicio de sesion disponibles.
        </p>
      )}
    </div>
  );
}
