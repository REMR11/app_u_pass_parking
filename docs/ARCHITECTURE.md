# Arquitectura del módulo parking

## Objetivo

Base **mantenible** para gestión de acceso a estacionamiento en **varios edificios**, con **pagos móviles** y despliegue **multi-empresa** (cambio de marca por configuración).

## Capas

1. **`src/app/`** — Rutas, layouts y composición. Mínima lógica de negocio.
2. **`src/components/`** — UI reutilizable (presentación).
3. **`src/domain/`** — Tipos y reglas de negocio puras (sin I/O).
4. **`src/lib/`** — Adaptadores: almacenes en memoria, integración futura con DB y PSP.
5. **`src/config/`** — Lectura de `process.env` para tenant y textos.
6. **`src/app/api/`** — Route Handlers HTTP (JSON). Autenticación vía sesión + middleware.

## Autenticación

- **NextAuth v5** con proveedor **Credentials** y usuario demo definido por variables de entorno (contraseña en texto solo para desarrollo; en producción usar OAuth o backend propio).
- **`src/middleware.ts`** protege `/dashboard/*` y APIs bajo `/api/parking/*` y `/api/payments/*`, y refresca la sesión de **Supabase Auth** cuando están configuradas las variables (ver [docs/SUPABASE.md](SUPABASE.md)).

Sustituir credenciales demo por proveedor OAuth (Google, Azure AD) o base de usuarios sin cambiar el patrón de middleware.

## Supabase (opcional)

Cliente en `src/utils/supabase/` (`server`, `client`, `middleware`). Sin `NEXT_PUBLIC_SUPABASE_*`, el refresco de sesión no hace efecto y la app sigue funcionando con NextAuth solo.

## Multi-tenant

Variables `NEXT_PUBLIC_*` y activos en `public/tenant/`. Cada cliente puede tener su propio despliegue o, en el futuro, resolución de tenant por subdominio leyendo la misma `getTenantConfig()` extendida.

## Pagos

`POST /api/payments/intent` valida entrada con **Zod** y delega en `createMobilePaymentIntent` (`src/lib/payments/mobile-intent.ts`). Hoy devuelve un stub; el siguiente paso es llamar al PSP y persistir el estado.

## Datos de edificios

`src/lib/parking/buildings-store.ts` simula persistencia. Reemplazar por consultas a base de datos manteniendo funciones `listBuildings` y `getBuildingById` o un repositorio explícito.

## Convenciones

- Validar entradas de API con Zod.
- Errores HTTP con cuerpo JSON `{ error: string }`.
- Componentes de cliente solo donde haya estado o eventos del navegador.
