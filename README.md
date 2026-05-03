# U-Pass Parking (Next.js)

Módulo base para **acceso a estacionamiento multi-edificio** y **pagos móviles**, con **login**, API versionada por rutas y configuración **multi-tenant** por variables de entorno.

## Inicio rápido

```bash
cp .env.example .env.local
# Edita AUTH_SECRET; opcional: Entra ID (AUTH_MICROSOFT_ENTRA_ID_*) y/o credenciales demo
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Puedes entrar con **Microsoft** si configuraste Entra ID, o con correo/contraseña demo si definiste `AUTH_DEMO_EMAIL` / `AUTH_DEMO_PASSWORD`.

## Documentación

- [docs/V0_UI.md](docs/V0_UI.md) — Cómo usar **V0** con este repo (prompts, carpetas, convenciones).
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Capas, auth, pagos y extensión futura.
- [docs/MICROSOFT_ENTRA_ID.md](docs/MICROSOFT_ENTRA_ID.md) — Login con **Microsoft Entra ID** (Azure).
- [docs/PAYMENTS_PSP.md](docs/PAYMENTS_PSP.md) — Integración de **pagos móviles** (PSP).
- [docs/TENANT_WHITELABEL.md](docs/TENANT_WHITELABEL.md) — **Marca multi-empresa**.

## Skills de Cursor

- `.cursor/skills/parking-v0-ui/SKILL.md` — UI con V0.
- `.cursor/skills/parking-auth-entra/SKILL.md` — Auth y Entra ID.
- `.cursor/skills/parking-payments-psp/SKILL.md` — Pagos y PSP.
- `.cursor/skills/parking-tenant-whitelabel/SKILL.md` — Marca y tenant.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — producción
- `npm run lint` — ESLint

## Multi-tenant

Ajusta `NEXT_PUBLIC_*` en `.env` y sustituye `public/tenant/logo.svg` por el logo del cliente (o usa `NEXT_PUBLIC_LOGO_URL`).

## Producción

- Genera `AUTH_SECRET` con `openssl rand -base64 32`.
- En producción usa **Microsoft Entra ID** (ver `docs/MICROSOFT_ENTRA_ID.md`) y elimina credenciales demo o déjalas vacías.
- Configura el proveedor de pagos dentro de `src/lib/payments/mobile-intent.ts` manteniendo el contrato de la API.
