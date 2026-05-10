# Arquitectura del módulo parking

## Objetivo

Base **mantenible** para gestión de acceso a estacionamiento en **varios edificios**, con **pagos móviles** y despliegue **multi-empresa** (cambio de marca por configuración).

## Capas

1. **`src/app/`** — Rutas, layouts y composición. Mínima lógica de negocio.
2. **`src/components/`** — UI reutilizable (presentación).
3. **`src/domain/`** — Tipos y reglas de negocio puras (sin I/O).
4. **`src/lib/`** — Adaptadores: almacenes en memoria, integración futura con DB, PSP y **notificaciones** (`src/lib/notifications/`).
5. **`src/config/`** — Lectura de `process.env` para tenant y textos.
6. **`src/app/api/`** — Route Handlers HTTP (JSON). Autenticación vía sesión + middleware.

## Autenticación

- **NextAuth v5** con **Microsoft Entra ID** opcional (`AUTH_MICROSOFT_ENTRA_ID_*`) y credenciales demo opcionales (`AUTH_DEMO_*`).
- **`src/middleware.ts`** protege `/dashboard/*` y APIs bajo `/api/parking/*` y `/api/payments/*`.
- Guía Azure: [docs/MICROSOFT_ENTRA_ID.md](docs/MICROSOFT_ENTRA_ID.md).

Sustituir o desactivar credenciales demo en producción; preferir solo Entra u otro IdP.

## Notificaciones

Correo transaccional (Resend opcional): [docs/NOTIFICATIONS.md](docs/NOTIFICATIONS.md). Bienvenida opcional tras `signIn` según `NOTIFICATIONS_WELCOME`.

## Supabase (opcional)

Cliente en `src/utils/supabase/` (`server`, `client`, `middleware`). Sin `NEXT_PUBLIC_SUPABASE_*`, el refresco de sesión no hace efecto y la app sigue funcionando con NextAuth solo.

## Multi-tenant

Variables `NEXT_PUBLIC_*` y activos en `public/tenant/`. Detalle: [docs/TENANT_WHITELABEL.md](docs/TENANT_WHITELABEL.md).

## Pagos

`POST /api/payments/intent` valida entrada con **Zod** y delega en `createMobilePaymentIntent` (`src/lib/payments/mobile-intent.ts`). Hoy devuelve un stub; extensión PSP: [docs/PAYMENTS_PSP.md](docs/PAYMENTS_PSP.md).

## Datos de edificios

`src/lib/parking/buildings-store.ts` simula persistencia. Reemplazar por consultas a base de datos manteniendo funciones `listBuildings` y `getBuildingById` o un repositorio explícito.

## Convenciones

- Validar entradas de API con Zod.
- Errores HTTP con cuerpo JSON `{ error: string }`.
- Componentes de cliente solo donde haya estado o eventos del navegador.
