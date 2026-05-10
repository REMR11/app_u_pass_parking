# Servicio de notificaciones (correo)

Capa en `src/lib/notifications/` para **plantillas**, **envío** y enganche con **Auth.js** (bienvenida opcional).

## Transporte

- **Resend** (recomendado para empezar): define `RESEND_API_KEY` y `NOTIFICATIONS_FROM_EMAIL` (dominio verificado o cuenta de prueba de Resend).
- Sin `RESEND_API_KEY`: no se envía correo real; en **desarrollo** verás `[notifications:skipped]` en la consola del servidor.

## Bienvenida tras login

Variable `NOTIFICATIONS_WELCOME`:

| Valor | Comportamiento |
|--------|----------------|
| `off` (por defecto) | No envía correo. |
| `new_user_only` | Solo si Auth.js marca `isNewUser` (habitual con **adapter** y base de datos; con solo JWT puede no ocurrir). |
| `each_signin` | Tras **cada** inicio de sesión exitoso (útil para probar; en producción suele ser demasiado). |

El contenido usa `getTenantConfig()` (nombre de app, soporte, etc.).

## Restablecimiento de contraseña

La plantilla `sendPasswordResetEmail` en `src/lib/notifications/service.ts` está lista para cuando implementes un flujo propio (token en BD + ruta `/reset-password`). Con **solo Microsoft Entra ID**, el reset lo gestiona Microsoft; no hace falta este correo salvo que tengáis usuarios locales.

## Añadir más correos

1. Añade plantilla en `templates.ts`.
2. Expón función en `service.ts` que llame a `deliverEmail`.
3. Invócala desde la acción de negocio correspondiente (API route, server action), no desde el cliente con secretos.

## Variables

Ver `.env.example` sección notificaciones.
