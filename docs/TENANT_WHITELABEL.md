# Multi-tenant / white-label (marca por empresa)

Este módulo está pensado para **replicarse por cliente** cambiando configuración y activos, no ramas de código distintas por cada empresa.

## Configuración actual

- **`src/config/tenant.ts`**: lee `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_TENANT_SHORT_NAME`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_LOGO_PATH`, `NEXT_PUBLIC_LOGO_URL`.
- **Colores de marca:** definidos en `src/app/globals.css` (tokens Tailwind `background`, `foreground`, `primary`, `secondary`, `accent`).
- **Logo**: archivo en `public/tenant/` (por defecto `logo.svg`) o URL remota con `NEXT_PUBLIC_LOGO_URL`.

## Despliegue por empresa (recomendado al inicio)

Un **proyecto o entorno** (por ejemplo en Vercel) por cliente, con sus propias variables `NEXT_PUBLIC_*` y su logo en `public/tenant/`. Ventaja: aislamiento simple y sin lógica de resolución de tenant en runtime.

## Evolución: un solo despliegue, varios tenants

Requiere extender `getTenantConfig()` para resolver tenant por:

- subdominio (`cliente.tudominio.com`), o
- cabecera / cookie acordada con tu gateway,

y opcionalmente cargar overrides desde base de datos. **No** pongas secretos ni datos sensibles en `NEXT_PUBLIC_*`.

## Microsoft Entra ID

El login con Entra define **identidad**, no la marca. Puedes usar el mismo registro de app para varios despliegues o uno por tenant según política de la organización cliente.

## Skill de Cursor

`.cursor/skills/parking-tenant-whitelabel/SKILL.md`.
