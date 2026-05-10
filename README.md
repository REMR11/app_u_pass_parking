# U-Pass Parking (Next.js)

Módulo base para **acceso a estacionamiento multi-edificio** y **pagos móviles**, con **login**, API versionada por rutas y configuración **multi-tenant** por variables de entorno.

## Inicio rápido

```bash
cp .env.example .env.local
# Edita AUTH_SECRET y credenciales demo
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Inicia sesión con `AUTH_DEMO_EMAIL` / `AUTH_DEMO_PASSWORD` definidos en `.env.local`.

## Documentación

- [docs/V0_UI.md](docs/V0_UI.md) — Cómo usar **V0** con este repo (prompts, carpetas, convenciones).
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Capas, auth, pagos y extensión futura.
- [docs/SUPABASE.md](docs/SUPABASE.md) — Cliente SSR/browser y middleware de sesión Supabase.

## Skill de Cursor

`.cursor/skills/parking-v0-ui/SKILL.md` orienta a agentes y a V0 sobre tokens, tenant y ubicación de componentes.

Skills opcionales de Supabase (CLI): `npx skills add supabase/agent-skills` — quedan en `.agents/skills/` si las instalas.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — producción
- `npm run lint` — ESLint

## Multi-tenant

Ajusta `NEXT_PUBLIC_*` en `.env` y sustituye `public/tenant/logo.svg` por el logo del cliente (o usa `NEXT_PUBLIC_LOGO_URL`).

## Producción

- Genera `AUTH_SECRET` con `openssl rand -base64 32`.
- En producción sustituye el login por **OAuth** (Google, Azure AD) o un backend de usuarios; la demo usa contraseña en texto solo por simplicidad local.
- Configura el proveedor de pagos dentro de `src/lib/payments/mobile-intent.ts` manteniendo el contrato de la API.
