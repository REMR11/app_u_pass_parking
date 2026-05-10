# U-Pass Parking (Next.js)

Módulo base para **acceso a estacionamiento multi-edificio** y **pagos móviles**, con **login por correo** (Supabase Auth), API por rutas y configuración **multi-tenant**.

## Inicio rápido

```bash
cp .env.example .env.local
# Completa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase → Settings → API)
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Crea una cuenta en **Registrarse** o entra con **Iniciar sesión**. Si activaste confirmación por correo en Supabase, revisa la bandeja de entrada.

## Documentación

- [docs/SUPABASE.md](docs/SUPABASE.md) — **Auth y SSR** (variables, callback `/auth/callback`, OAuth opcional).
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Capas, auth, pagos y extensión futura.
- [docs/V0_UI.md](docs/V0_UI.md) — **V0** (prompts y convenciones).
- [docs/MICROSOFT_ENTRA_ID.md](docs/MICROSOFT_ENTRA_ID.md) — Referencia Azure; SSO Microsoft vía **proveedor Supabase** (ver SUPABASE.md).
- [docs/PAYMENTS_PSP.md](docs/PAYMENTS_PSP.md) — Pagos móviles (PSP).
- [docs/TENANT_WHITELABEL.md](docs/TENANT_WHITELABEL.md) — Marca multi-empresa.
- [docs/NOTIFICATIONS.md](docs/NOTIFICATIONS.md) — Correos (Resend).

## Skills de Cursor

- `.cursor/skills/parking-v0-ui/SKILL.md` — UI con V0.
- `.cursor/skills/parking-auth-entra/SKILL.md` — SSO Microsoft vía Supabase.
- `.cursor/skills/parking-payments-psp/SKILL.md` — Pagos y PSP.
- `.cursor/skills/parking-tenant-whitelabel/SKILL.md` — Marca y tenant.
- `.cursor/skills/parking-notifications-email/SKILL.md` — Correos transaccionales.

Skills opcionales: `npx skills add supabase/agent-skills` → `.agents/skills/`.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — producción
- `npm run lint` — ESLint
- `npm run test` — Vitest (validación Zod de auth)

## Multi-tenant

Ajusta `NEXT_PUBLIC_*` en `.env` y sustituye `public/tenant/logo.svg` (o `NEXT_PUBLIC_LOGO_URL`). Paleta en `src/app/globals.css`.

## Producción

- Configura **Redirect URLs** en Supabase Authentication (`https://tu-dominio/auth/callback`).
- Opcional: **Resend** para correos (`docs/NOTIFICATIONS.md`).
- Pagos: extender `src/lib/payments/mobile-intent.ts` según `docs/PAYMENTS_PSP.md`.
