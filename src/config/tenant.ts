/**
 * Configuración multi-tenant por variables de entorno.
 * Cada despliegue (por empresa) define marca, textos y activos sin tocar código.
 */
export type TenantConfig = {
  appName: string;
  shortName: string;
  supportEmail: string;
  logoPath: string;
  /** URL absoluta opcional para logo remoto (prioridad sobre logoPath si está definida) */
  logoUrl?: string;
};

function readEnv(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() !== "" ? v : fallback;
}

export function getTenantConfig(): TenantConfig {
  return {
    appName: readEnv("NEXT_PUBLIC_APP_NAME", "U-Pass Parking"),
    shortName: readEnv("NEXT_PUBLIC_TENANT_SHORT_NAME", "U-Pass"),
    supportEmail: readEnv("NEXT_PUBLIC_SUPPORT_EMAIL", "soporte@ejemplo.com"),
    logoPath: readEnv("NEXT_PUBLIC_LOGO_PATH", "/tenant/logo.svg"),
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL?.trim() || undefined,
  };
}
