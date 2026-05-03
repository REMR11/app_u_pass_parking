---
name: parking-notifications-email
description: Correos transaccionales (bienvenida, reset) vía src/lib/notifications y Resend.
---

# Skill: Notificaciones por correo

## Cuándo usar

Al añadir plantillas, transporte, variables `RESEND_*` / `NOTIFICATIONS_*`, o enganchar envíos tras auth u otras acciones de negocio.

## Reglas

1. **Secretos:** `RESEND_API_KEY` solo en servidor; nunca en `NEXT_PUBLIC_*`.
2. **Envío:** usar `deliverEmail` / funciones de `src/lib/notifications/service.ts`; plantillas en `templates.ts`.
3. **Bienvenida:** controlada por `NOTIFICATIONS_WELCOME`; por defecto `off`. `each_signin` solo para pruebas.
4. **Reset de contraseña:** plantilla lista; el flujo (token + ruta) se implementa aparte; con solo Entra el reset es de Microsoft.
5. **Errores:** los hooks de auth no deben lanzar; registrar con `console.warn` y seguir.

## Referencias

- `docs/NOTIFICATIONS.md`
- `src/lib/notifications/`
