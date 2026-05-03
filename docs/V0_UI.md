# Guía para generar UI con V0 (Vercel)

Este proyecto está preparado para que **V0** genere o refine componentes sin romper la arquitectura.

## Qué debe saber V0 del stack

- **Framework:** Next.js 15 (App Router), **React 19**, **TypeScript**.
- **Estilos:** Tailwind CSS v4 (`@import "tailwindcss"` en `src/app/globals.css`).
- **Rutas:** páginas en `src/app/`, componentes reutilizables en `src/components/`.
- **Colores:** usar clases `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-secondary`, `bg-accent`. La paleta está en `src/app/globals.css`.
- **Multi-tenant:** no hardcodear nombre de empresa ni URLs de logo; asumir props o `getTenantConfig()` desde `@/config/tenant` en Server Components.

## Prompt sugerido para V0

Copia y adapta:

> Genera un componente React (TypeScript) para Next.js App Router, solo cliente si usa estado (`"use client"`). Usa Tailwind v4 y las clases semánticas `background`, `foreground`, `primary`. Debe encajar en el parking corporativo multi-edificio: lista de edificios con ocupación, botón de pago móvil, y barra superior con slot para logo. Exporta un único componente por archivo, nombres en español para labels de UI. No incluyas fetch a dominios externos; usa props tipadas.

## Dónde pegar el código

| Tipo de UI        | Carpeta sugerida                          |
|-------------------|--------------------------------------------|
| Layout / shell    | `src/components/layout/`                  |
| Formularios auth  | `src/components/auth/`                    |
| Pagos / checkout  | `src/components/payments/`                |
| Marca / logo      | `src/components/tenant/`                  |

Tras generar, conecta rutas en `src/app/dashboard/...` y mantén las **Server Actions** o **route handlers** existentes para datos sensibles.

## Evitar

- Estilos inline largos en lugar de Tailwind (salvo variables CSS ya definidas).
- Librerías UI extra no acordadas con el equipo (añadir dependencia solo si es necesaria).
- Lógica de pago real en el cliente: el cliente solo dispara; la API valida en servidor.

## Referencia de tokens

Ver `src/app/globals.css` para `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`.
