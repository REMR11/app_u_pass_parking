---
name: parking-auth-entra
description: Configurar y extender autenticación con Microsoft Entra ID y NextAuth en el módulo parking.
---

# Skill: Auth con Microsoft Entra ID

## Cuándo usar

Al tocar `src/auth.ts`, `/login`, variables `AUTH_*`, registro de aplicación en Azure o flujos OAuth.

## Reglas

1. **Proveedor:** usar `MicrosoftEntraID` desde `next-auth/providers/microsoft-entra-id`. El id del proveedor es `microsoft-entra-id` (para `signIn("microsoft-entra-id", …)`).
2. **Callback URL** en Azure debe coincidir con `{AUTH_URL o origen}/api/auth/callback/microsoft-entra-id`. Documentar en `docs/MICROSOFT_ENTRA_ID.md`.
3. **Producción:** definir `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID` con el GUID del directorio para restringir inicio de sesión al tenant corporativo cuando aplique.
4. **No** mezclar lógica de marca multi-empresa dentro de callbacks de Entra salvo que mapees claims explícitos (por ejemplo `tid`) a configuración interna **no** pública.
5. **Credenciales demo:** solo para desarrollo; en producción preferir solo Entra u otro IdP y eliminar `AUTH_DEMO_PASSWORD`.
6. **Sesión:** mantener JWT + `session.user.id` estable; si añades campos a la sesión, extender tipos en `declare module "next-auth"` en `src/auth.ts`.

## Referencias

- `docs/MICROSOFT_ENTRA_ID.md`
- `docs/ARCHITECTURE.md` (sección autenticación)
