export type SendEmailResult =
  | { ok: true; providerId?: string }
  | { ok: false; reason: "no_transport" | "missing_recipient" | "send_failed"; detail?: string };

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};
