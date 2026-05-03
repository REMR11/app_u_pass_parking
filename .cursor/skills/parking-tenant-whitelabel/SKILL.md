---
name: parking-tenant-whitelabel
description: Marca multi-empresa, variables NEXT_PUBLIC_ y activos sin acoplar a Entra ID.
---

# Skill: Multi-tenant / white-label

## Cuándo usar

Al cambiar nombre de producto, logos, colores, textos legales o despliegues por cliente.

## Reglas

1. **Marca:** usar `getTenantConfig()` desde `@/config/tenant` o props; no incrustar nombres de empresa fijos en componentes genéricos.
2. **Público vs secreto:** solo datos no sensibles en `NEXT_PUBLIC_*`. URLs de logo pueden ser públicas; API keys nunca.
3. **Activos:** preferir `public/tenant/` por despliegue; `NEXT_PUBLIC_LOGO_URL` para CDN del cliente.
4. **Colores:** la paleta base vive en `src/app/globals.css` (`primary`, `secondary`, `accent`, `background`, `foreground`). Para otro cliente se pueden sustituir variables CSS o ampliar con tokens propios.
5. **Entra ID:** es identidad (SSO), no sustituye esta configuración de marca salvo que documentes un mapeo explícito (por tenant de Azure a config).

## Referencias

- `docs/TENANT_WHITELABEL.md`
- `src/config/tenant.ts`
