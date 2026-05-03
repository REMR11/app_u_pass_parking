# Microsoft Entra ID (Azure AD) con este proyecto

Sí: puedes usar **Microsoft Entra ID** para el login. En el código está el proveedor oficial de Auth.js: `microsoft-entra-id`. La **marca** (nombre, logo, colores) sigue siendo multi-tenant por `NEXT_PUBLIC_*`: Entra resuelve **identidad**, no sustituye la configuración visual por empresa.

## Qué registrar en Azure

1. En [Microsoft Entra admin center](https://entra.microsoft.com/) → **Aplicaciones** → **Registros de aplicaciones** → **Nuevo registro**.
2. Tipos de cuenta: según necesites solo tu organización o cuentas personales y laborales.
3. **URI de redirección** (plataforma web):

   `https://<tu-dominio>/api/auth/callback/microsoft-entra-id`

   En local (con `next dev`):

   `http://localhost:3000/api/auth/callback/microsoft-entra-id`

4. Anota **Id. de aplicación (cliente)** y crea un **secreto de cliente** en **Certificados y secretos**.

5. Permisos: el proveedor pide ámbitos `openid profile email User.Read` (Graph para foto de perfil). Para inicio de sesión basta con lo que concede el flujo OIDC estándar; si la foto falla, el login puede seguir funcionando.

## Variables de entorno

En `.env.local` (o en Vercel):

```bash
AUTH_SECRET=           # openssl rand -base64 32
AUTH_MICROSOFT_ENTRA_ID_ID=<Application (client) ID>
AUTH_MICROSOFT_ENTRA_ID_SECRET=<Client secret value>

# Recomendado en producción: solo tu tenant (GUID del directorio)
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=<Directory (tenant) ID>
```

Si **no** defines `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID`, Auth.js usa el endpoint `common` (más permisivo; revisa si encaja con tu política de seguridad).

Los nombres `AUTH_MICROSOFT_ENTRA_ID_*` son los que espera Auth.js v5; ver [documentación del proveedor](https://authjs.dev/getting-started/providers/microsoft-entra-id).

## Comportamiento en la app

- Si están `AUTH_MICROSOFT_ENTRA_ID_ID` y `AUTH_MICROSOFT_ENTRA_ID_SECRET`, en `/login` aparece **Continuar con Microsoft**.
- Las credenciales demo (`AUTH_DEMO_EMAIL` / `AUTH_DEMO_PASSWORD`) son **opcionales**: si las quitas, solo quedará Microsoft (o el mensaje de “sin proveedores” si tampoco hay Entra).

## Entra ID vs “tenant” del producto

| Concepto | Rol |
|----------|-----|
| **Entra ID** | Quién es el usuario (SSO corporativo). |
| **NEXT_PUBLIC_* + logo** | Cómo se ve la app para cada empresa/cliente. |

Más adelante puedes mapear `tid` (tenant de Azure) o grupos de Entra a permisos internos; eso vive en callbacks de `src/auth.ts` o en tu API, no en variables públicas.

## Skill de Cursor

Ver `.cursor/skills/parking-auth-entra/SKILL.md` para reglas al tocar auth o despliegues.
