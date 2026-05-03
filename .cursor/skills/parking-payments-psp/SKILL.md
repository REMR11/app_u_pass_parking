---
name: parking-payments-psp
description: Integrar y mantener pagos móviles con PSP (webhooks, idempotencia, servidor) en el módulo parking.
---

# Skill: Pagos móviles (PSP)

## Cuándo usar

Al cambiar `POST /api/payments/intent`, librerías de Stripe/Mercado Pago/etc., webhooks o modelo de estados de pago.

## Reglas

1. **Servidor:** toda creación de intención, sesión de checkout o captura real ocurre en **route handlers** o server actions con sesión validada; el cliente no decide el importe final sin revalidación.
2. **Validación:** usar **Zod** en el cuerpo de la API; errores con `{ error: string }` y códigos HTTP adecuados (400, 401, 404).
3. **Idempotencia:** clave de idempotencia por operación de negocio al llamar al PSP.
4. **Webhooks:** verificar firma del proveedor; actualizar estado en base de datos; no confiar solo en redirección del navegador.
5. **Secretos:** variables sin prefijo `NEXT_PUBLIC_`; nunca exponer claves secretas al bundle del cliente.
6. **Dominio:** tipos en `src/domain/parking/types.ts` o extensión dedicada; persistencia en `src/lib/payments/` o repositorio futuro.

## Referencias

- `docs/PAYMENTS_PSP.md`
- `src/lib/payments/mobile-intent.ts`
- `src/app/api/payments/intent/route.ts`
