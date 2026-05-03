import { deliverEmail } from "@/lib/notifications/transport";
import type { SendEmailResult } from "@/lib/notifications/types";
import { buildPasswordResetEmail, buildWelcomeEmail } from "@/lib/notifications/templates";

export async function sendWelcomeEmail(params: {
  to: string;
  name?: string | null;
}): Promise<SendEmailResult> {
  const { subject, html, text } = buildWelcomeEmail({ email: params.to, name: params.name });
  return deliverEmail({ to: params.to, subject, html, text });
}

/**
 * Llamar desde tu flujo de "olvidé contraseña" cuando generes `resetUrl` (token firmado en tu API).
 * No está enlazado a NextAuth Credentials por defecto (el reset lo suele dar Entra o un flujo propio).
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  name?: string | null;
  resetUrl: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = buildPasswordResetEmail({
    email: params.to,
    name: params.name,
    resetUrl: params.resetUrl,
  });
  return deliverEmail({ to: params.to, subject, html, text });
}
