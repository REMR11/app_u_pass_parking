# Supabase (SSR + Auth con Next.js)

## Variables

Copia `.env.example` a `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto (Settings → API).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clave **anon** (pública; la seguridad fina es **RLS** en Postgres).

**No** uses **service_role** en el navegador ni en `NEXT_PUBLIC_*`.

En **Authentication → URL configuration** añade redirecciones:

- `http://localhost:3000/auth/callback`
- `https://<tu-dominio-producción>/auth/callback`

## Autenticación por correo

- Registro e inicio de sesión usan **Supabase Auth** (`signUp` / `signInWithPassword`), que persiste en el esquema interno `auth` (p. ej. `auth.users`).
- Server Actions: `src/app/auth/actions.ts` (`signInWithEmailPassword`, `signUpWithEmail`, `signOutAction`).
- Validación compartida y tests: `src/lib/auth/schemas.ts`.
- Sesión en cookie JWT refrescada por `src/utils/supabase/middleware.ts` y `src/middleware.ts`.
- OAuth (Azure, Google, …): configura el proveedor en el dashboard de Supabase y usa `signInWithOAuth` desde cliente si lo necesitas; el callback es **`/auth/callback`** (`src/app/auth/callback/route.ts`).

## Archivos

| Ruta | Uso |
|------|-----|
| `src/utils/supabase/server.ts` | `createClient(await cookies())` en RSC, actions y route handlers. |
| `src/utils/supabase/client.ts` | `createBrowserSupabaseClient()` en Client Components. |
| `src/utils/supabase/middleware.ts` | `updateSession` — refresca sesión y devuelve usuario. |
| `src/lib/auth/session.ts` | `getSessionUser()`, `getUserDisplayName()`. |

Sin variables Supabase, el middleware **no protege** rutas (modo desarrollo); la página de login muestra aviso si faltan claves.

## Ejemplo en un Server Component

```tsx
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  const supabase = createClient(await cookies());
  const { data } = await supabase.from("tu_tabla").select();
}
```

## Skills opcionales para el agente

```bash
npx skills add supabase/agent-skills
```
