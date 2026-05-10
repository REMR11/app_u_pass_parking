import type { AuthError } from "@supabase/supabase-js";

/** Mensajes en español para errores frecuentes de Supabase Auth (auth.users / GoTrue). */
export function mapAuthError(error: AuthError | null): string {
  if (!error) return "Error de autenticación";

  const msg = error.message?.toLowerCase() ?? "";

  if (error.status === 400 && msg.includes("invalid login")) {
    return "Correo o contraseña incorrectos.";
  }
  if (msg.includes("email not confirmed") || msg.includes("signup_disabled")) {
    return "Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.";
  }
  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "Ya existe una cuenta con este correo. Inicia sesión.";
  }
  if (msg.includes("password")) {
    return "La contraseña no cumple los requisitos del sistema.";
  }
  if (msg.includes("rate limit")) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }

  return error.message || "No se pudo completar la operación.";
}
