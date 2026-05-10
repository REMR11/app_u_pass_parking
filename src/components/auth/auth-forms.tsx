"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

interface AuthFormsProps {
  callbackUrl: string;
  showMicrosoftLogin?: boolean;
  showCredentialsLogin?: boolean;
  errorMessage?: string;
}

type AuthTab = "login" | "register";

export function AuthForms({
  callbackUrl,
  showMicrosoftLogin,
  showCredentialsLogin = true,
  errorMessage,
}: AuthFormsProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <div className="flex flex-col gap-6">
      {/* Tab switcher */}
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

      {/* Form content */}
      {activeTab === "login" ? (
        <LoginForm
          callbackUrl={callbackUrl}
          showMicrosoftLogin={showMicrosoftLogin}
          showCredentialsLogin={showCredentialsLogin}
          errorMessage={errorMessage}
        />
      ) : (
        <RegisterForm
          callbackUrl={callbackUrl}
          onSwitchToLogin={() => setActiveTab("login")}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN FORM
// ─────────────────────────────────────────────────────────────────────────────

interface LoginFormProps {
  callbackUrl: string;
  showMicrosoftLogin?: boolean;
  showCredentialsLogin?: boolean;
  errorMessage?: string;
}

function LoginForm({
  callbackUrl,
  showMicrosoftLogin,
  showCredentialsLogin = true,
  errorMessage,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(errorMessage ?? null);
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const isFormValid = email.trim() !== "" && password.trim() !== "" && isValidEmail(email);

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
    
    if (!password.trim()) {
      setError("Ingresa tu contraseña");
      return;
    }
    
    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
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
        setError("Credenciales inválidas. Verifica tu correo y contraseña.");
        return;
      }
      
      if (res?.url) {
        router.push(res.url);
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("Error de conexión. Intenta nuevamente.");
    }
  }

  async function onMicrosoftSignIn() {
    setError(null);
    setMsLoading(true);
    try {
      await signIn("microsoft-entra-id", { callbackUrl });
    } catch {
      setMsLoading(false);
      setError("Error al conectar con Microsoft.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Microsoft login */}
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

      {/* Email/Password form */}
      {showCredentialsLogin && (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium text-foreground">
              Correo electrónico
            </label>
            <div className="relative">
              <input
                id="login-email"
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

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium text-foreground">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Tu contraseña"
                className="w-full h-14 px-4 pr-14 rounded-2xl border-2 border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground/60 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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

          {/* Forgot password link */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-primary font-medium hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Error */}
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

          {/* Submit */}
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
              "Iniciar sesión"
            )}
          </button>
        </form>
      )}

      {!showMicrosoftLogin && !showCredentialsLogin && (
        <p className="text-sm text-center text-muted-foreground">
          No hay métodos de inicio de sesión disponibles.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER FORM
// ─────────────────────────────────────────────────────────────────────────────

interface RegisterFormProps {
  callbackUrl: string;
  onSwitchToLogin: () => void;
}

function RegisterForm({ callbackUrl, onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const isValidEmail = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const passwordStrength = useCallback((pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
  }, []);

  const getPasswordStrengthLabel = (strength: number) => {
    switch (strength) {
      case 0: return { label: "Muy débil", color: "bg-destructive" };
      case 1: return { label: "Débil", color: "bg-destructive" };
      case 2: return { label: "Moderada", color: "bg-warning" };
      case 3: return { label: "Fuerte", color: "bg-success" };
      case 4: return { label: "Muy fuerte", color: "bg-success" };
      default: return { label: "", color: "" };
    }
  };

  const isFormValid = 
    name.trim() !== "" &&
    email.trim() !== "" && 
    isValidEmail(email) &&
    password.length >= 8 &&
    password === confirmPassword &&
    acceptTerms;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Ingresa tu nombre completo");
      return;
    }

    if (!email.trim()) {
      setError("Ingresa tu correo electrónico");
      return;
    }
    
    if (!isValidEmail(email)) {
      setError("Ingresa un correo electrónico válido");
      return;
    }
    
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    setError(null);
    setLoading(true);
    
    // Simulate registration API call
    // In a real app, this would call your registration endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSuccess(true);
    
    // After showing success, switch to login
    setTimeout(() => {
      onSwitchToLogin();
    }, 2000);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground">¡Registro exitoso!</h3>
        <p className="text-sm text-muted-foreground text-center">
          Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...
        </p>
      </div>
    );
  }

  const strength = passwordStrength(password);
  const strengthInfo = getPasswordStrengthLabel(strength);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="register-name" className="text-sm font-medium text-foreground">
          Nombre completo
        </label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Juan Pérez"
          className="w-full h-14 px-4 rounded-2xl border-2 border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground/60 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="register-email" className="text-sm font-medium text-foreground">
          Correo electrónico
        </label>
        <div className="relative">
          <input
            id="register-email"
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

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="register-password" className="text-sm font-medium text-foreground">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Mínimo 8 caracteres"
            className="w-full h-14 px-4 pr-14 rounded-2xl border-2 border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground/60 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
        {/* Password strength indicator */}
        {password && (
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    strength >= level ? strengthInfo.color : "bg-foreground/10"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Seguridad: <span className="font-medium">{strengthInfo.label}</span>
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="register-confirm-password" className="text-sm font-medium text-foreground">
          Confirmar contraseña
        </label>
        <div className="relative">
          <input
            id="register-confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Repite tu contraseña"
            className="w-full h-14 px-4 rounded-2xl border-2 border-foreground/10 bg-background text-foreground placeholder:text-muted-foreground/60 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          {confirmPassword && password === confirmPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
          )}
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
        )}
      </div>

      {/* Terms acceptance */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-5 h-5 rounded-md border-2 border-foreground/20 bg-background peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
            {acceptTerms && (
              <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-muted-foreground leading-snug">
          Acepto los{" "}
          <button type="button" className="text-primary font-medium hover:underline">
            términos y condiciones
          </button>{" "}
          y la{" "}
          <button type="button" className="text-primary font-medium hover:underline">
            política de privacidad
          </button>
        </span>
      </label>

      {/* Error */}
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

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="w-full h-14 mt-2 rounded-2xl bg-primary text-primary-foreground font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creando cuenta...
          </span>
        ) : (
          "Crear cuenta"
        )}
      </button>
    </form>
  );
}
