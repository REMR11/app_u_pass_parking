# Arquitectura del módulo parking

## Objetivo

Base **mantenible** para gestión de acceso a estacionamiento en **varios edificios**, con **pagos móviles** y despliegue **multi-empresa** (cambio de marca por configuración).

## Capas

1. **`src/app/`** — Rutas, layouts y composición. Mínima lógica de negocio.
2. **`src/components/`** — UI reutilizable (presentación).
3. **`src/domain/`** — Tipos y reglas de negocio puras (sin I/O).
4. **`src/lib/`** — Adaptadores: dominio (`src/lib/auth/` para validaciones y sesión de lectura), almacenes en memoria, PSP y **notificaciones**.
5. **`src/config/`** — Lectura de `process.env` para tenant y textos.
6. **`src/app/api/`** — Route Handlers HTTP (JSON). Protección con sesión Supabase + middleware.

## Autenticación

- **Supabase Auth** para **correo y contraseña** (tablas internas `auth.*`; ver panel Supabase).
- **`src/app/auth/actions.ts`** — Server Actions: login, registro, cierre de sesión.
- **`src/middleware.ts`** — Refresco de sesión (`updateSession`) y protección de `/dashboard`, `/parking` y APIs `/api/parking`, `/api/payments`.
- **`src/lib/auth/session.ts`** — `getSessionUser()` en layouts y páginas servidor.

Guía detallada: [docs/SUPABASE.md](SUPABASE.md).

## Notificaciones

Correo transaccional (Resend opcional): [docs/NOTIFICATIONS.md](NOTIFICATIONS.md). Tras login/registro Supabase se puede enviar bienvenida vía `src/lib/auth/welcome.ts` según `NOTIFICATIONS_WELCOME`.

## Multi-tenant

Variables `NEXT_PUBLIC_*` y activos en `public/tenant/`. Detalle: [docs/TENANT_WHITELABEL.md](TENANT_WHITELABEL.md).

## Pagos

`POST /api/payments/intent` valida entrada con **Zod** y delega en `createMobilePaymentIntent`. Stub PSP: [docs/PAYMENTS_PSP.md](PAYMENTS_PSP.md).

## Datos de edificios

`src/lib/parking/buildings-store.ts` simula persistencia. Reemplazar por consultas a base de datos manteniendo contratos del dominio.

## Convenciones

- Validar entradas de API y acciones con **Zod**.
- Errores HTTP con cuerpo JSON `{ error: string }`.
- Componentes cliente solo donde haya estado o eventos del navegador.
