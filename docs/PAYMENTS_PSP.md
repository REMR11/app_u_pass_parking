# Pagos móviles (PSP) en este módulo

## Estado actual

`POST /api/payments/intent` valida el cuerpo con **Zod** y delega en `src/lib/payments/mobile-intent.ts`, que hoy devuelve un **stub** (sin cargo real).

## Principios al integrar un PSP (Stripe, Mercado Pago, etc.)

1. **Importe y moneda** se confirman en el **servidor** tras validar la sesión; el cliente solo propone valores.
2. **Idempotencia**: usar claves de idempotencia en el PSP para no duplicar cargos si el cliente reintenta.
3. **Webhooks**: el estado final (`succeeded` / `failed`) debe venir del **webhook firmado** del PSP, no solo de la respuesta del checkout en el navegador.
4. **Persistencia**: guardar `payment_intent_id` (o equivalente), `buildingId`, usuario, importe y estado en base de datos.
5. **Secretos**: API keys solo en variables de entorno del servidor (`STRIPE_SECRET_KEY`, etc.); nunca `NEXT_PUBLIC_*` para secretos.

## Dónde extender

| Pieza | Archivo / ruta sugerida |
|-------|-------------------------|
| Lógica de creación de cargo / sesión de checkout | `src/lib/payments/mobile-intent.ts` o un módulo hermano `psp-stripe.ts` importado desde ahí |
| Webhook del PSP | Nuevo route handler `src/app/api/payments/webhook/route.ts` (verificar firma del proveedor) |
| Contrato HTTP actual | Mantener JSON estable para la UI; si cambia, versionar (`/api/v2/...`) o documentar en README |

## Skill de Cursor

`.cursor/skills/parking-payments-psp/SKILL.md` resume reglas para agentes al tocar pagos.
