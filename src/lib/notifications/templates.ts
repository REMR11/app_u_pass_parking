import { getTenantConfig } from "@/config/tenant";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildWelcomeEmail(params: { name?: string | null; email: string }) {
  const tenant = getTenantConfig();
  const greetingName = params.name?.trim() || params.email;
  const subject = `Bienvenido a ${tenant.appName}`;
  const text = `Hola ${greetingName},

Gracias por acceder a ${tenant.appName}. Ya puedes usar el panel de estacionamiento.

Si no fuiste tú, ignora este mensaje o contacta a ${tenant.supportEmail}.

— ${tenant.shortName}
`;
  const html = `<p>Hola ${escapeHtml(greetingName)},</p>
<p>Gracias por acceder a <strong>${escapeHtml(tenant.appName)}</strong>. Ya puedes usar el panel de estacionamiento.</p>
<p>Si no fuiste tú, ignora este mensaje o contacta a <a href="mailto:${escapeHtml(tenant.supportEmail)}">${escapeHtml(tenant.supportEmail)}</a>.</p>
<p>— ${escapeHtml(tenant.shortName)}</p>`;
  return { subject, html, text };
}

export function buildPasswordResetEmail(params: { name?: string | null; email: string; resetUrl: string }) {
  const tenant = getTenantConfig();
  const greetingName = params.name?.trim() || params.email;
  const subject = `Restablecer contraseña · ${tenant.appName}`;
  const text = `Hola ${greetingName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${tenant.appName}.

Abre este enlace (caduca según la política que definas en la app):
${params.resetUrl}

Si no solicitaste el cambio, ignora este correo.

— ${tenant.shortName}
`;
  const safeUrl = escapeHtml(params.resetUrl);
  const html = `<p>Hola ${escapeHtml(greetingName)},</p>
<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>${escapeHtml(tenant.appName)}</strong>.</p>
<p><a href="${safeUrl}">Restablecer contraseña</a></p>
<p>Si no solicitaste el cambio, ignora este correo.</p>
<p>— ${escapeHtml(tenant.shortName)}</p>`;
  return { subject, html, text };
}
