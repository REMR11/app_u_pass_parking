/** Remitente; en Resend debe ser un dominio verificado o la cuenta de prueba. */
export function getNotificationsFromEmail(): string {
  return process.env.NOTIFICATIONS_FROM_EMAIL?.trim() || "onboarding@resend.dev";
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/**
 * - `off`: no envía bienvenida automática tras login.
 * - `new_user_only`: solo si Auth.js indica `isNewUser` (típico con adapter; sin adapter puede no dispararse).
 * - `each_signin`: cada inicio de sesión exitoso (útil en desarrollo; evitar en producción salvo caso muy controlado).
 */
export function getWelcomeNotificationMode(): "off" | "new_user_only" | "each_signin" {
  const raw = process.env.NOTIFICATIONS_WELCOME?.trim().toLowerCase();
  if (raw === "each_signin" || raw === "on_each_signin") return "each_signin";
  if (raw === "new_user_only" || raw === "first") return "new_user_only";
  return "off";
}
