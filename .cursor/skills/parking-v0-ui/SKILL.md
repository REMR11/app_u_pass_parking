---
name: parking-v0-ui
description: Generar o adaptar UI de parking multi-edificio con V0 para este repo Next.js + Tailwind v4.
---

# Skill: UI parking con V0

## Cuándo usar

Al pedir componentes, pantallas o refinos visuales para **estacionamiento multi-edificio**, **login**, **panel** o **pagos móviles** en este repositorio.

## Reglas

1. **Stack:** Next.js App Router, TypeScript, Tailwind v4. Preferir Server Components salvo que haya estado; entonces `"use client"`.
2. **Tokens:** `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-secondary`, `text-secondary` (si aplica), `bg-accent`. La paleta base está en `src/app/globals.css`; no incrustar hex distintos salvo excepción documentada.
3. **Tenant:** textos de producto y logo vía `@/config/tenant` o props; no incrustar nombres de empresa concretos en componentes genéricos.
4. **Ubicación:** nuevos bloques en `src/components/layout`, `auth`, `payments` o `tenant`; páginas solo en `src/app/`.
5. **Datos:** la UI consume props o fetch a rutas internas `/api/...`; no exponer secretos ni lógica de cobro solo en cliente.
6. **Idioma:** etiquetas y copy de interfaz en **español**.

## Documentación

Leer `docs/V0_UI.md` antes de proponer estructura de componentes.

## Checklist post-generación

- Tipos explícitos en props públicas.
- Accesibilidad básica (labels en inputs, contraste).
- No añadir dependencias sin necesidad; coordinar con el equipo si se requiere una librería UI.
