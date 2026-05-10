---
name: parking-auth-entra
description: SSO corporativo (Azure/Microsoft) integrado vía Supabase Auth en el módulo parking.
---

# Skill: SSO Microsoft / Azure con Supabase

## Estado del repo

El login principal es **correo + contraseña** con **Supabase Auth** (`src/app/auth/actions.ts`, `docs/SUPABASE.md`).  
Este skill aplica cuando quieras **Microsoft / Azure AD** además del correo.

## Enfoque recomendado

Configura el proveedor **Azure** en el dashboard de Supabase (Authentication → Providers) y usa **`signInWithOAuth`** con el cliente navegador (`createBrowserSupabaseClient`). El callback de la app es **`/auth/callback`** (`src/app/auth/callback/route.ts`), no NextAuth.

## Reglas

1. No reintroducir **NextAuth** para Entra salvo decisión explícita del equipo (duplica sesiones y mantenimiento).
2. Añadir la URL de callback de Supabase (`…/auth/v1/callback` la gestiona Supabase; tu app usa `/auth/callback` para el intercambio PKCE).
3. Mantén la lógica de marca (`NEXT_PUBLIC_*`) fuera de claims OAuth salvo mapeo documentado.
4. Producción: restricción por tenant vía configuración del proveedor en Sup/Azure, no credenciales demo.

## Referencias

- [docs/SUPABASE.md](docs/SUPABASE.md)
- [docs/MICROSOFT_ENTRA_ID.md](docs/MICROSOFT_ENTRA_ID.md) (referencia Azure clásica; adaptar pasos al proveedor Supabase)
