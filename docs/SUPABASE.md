# Supabase (SSR con Next.js)

## Variables

Copia `.env.example` a `.env.local` y define:

- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto (Settings → API).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clave **anon** (pública en el cliente; el control real va con RLS en Postgres).

**No** pegues la **service_role** en el frontend ni en `NEXT_PUBLIC_*`.

## Archivos

| Ruta | Uso |
|------|-----|
| `src/utils/supabase/server.ts` | Server Components / Route Handlers: `createClient(await cookies())`. |
| `src/utils/supabase/client.ts` | Client Components: `createClient()`. |
| `src/utils/supabase/middleware.ts` | `updateSession(request)` — refresca cookies de sesión. |

El **`src/middleware.ts`** del proyecto llama a `updateSession` antes de las reglas de NextAuth y amplía el `matcher` para refrescar la sesión en casi todas las rutas (patrón recomendado por Supabase).

Si las variables no están definidas, `updateSession` no hace nada (respuesta `next` sin error), útil hasta que configures el proyecto.

## Ejemplo en un Server Component

```tsx
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.from("tu_tabla").select();
  // ...
}
```

## Skills opcionales para el agente

```bash
npx skills add supabase/agent-skills
```
