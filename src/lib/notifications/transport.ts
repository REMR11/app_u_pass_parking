import type { EmailMessage, SendEmailResult } from "@/lib/notifications/types";
import { getNotificationsFromEmail, isResendConfigured } from "@/lib/notifications/config";

type ResendCreateResponse = { id?: string };

/**
 * Envío vía [Resend](https://resend.com/docs/api-reference/emails/send-email) si existe `RESEND_API_KEY`.
 * Sin clave: en desarrollo registra en consola; en producción devuelve `no_transport`.
 */
export async function deliverEmail(message: EmailMessage): Promise<SendEmailResult> {
  if (!message.to.trim()) {
    return { ok: false, reason: "missing_recipient" };
  }

  const from = getNotificationsFromEmail();

  if (!isResendConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.info("[notifications:skipped]", { to: message.to, subject: message.subject });
    }
    return { ok: false, reason: "no_transport" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, reason: "send_failed", detail: `${res.status} ${body.slice(0, 200)}` };
  }

  const json = (await res.json()) as ResendCreateResponse;
  return { ok: true, providerId: json.id };
}
