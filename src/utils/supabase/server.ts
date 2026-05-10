import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseCredentials(): boolean {
  return Boolean(supabaseUrl?.trim() && supabaseKey?.trim());
}

/** Cliente servidor para Route Handlers, Server Actions y RSC. Requiere variables configuradas. */
export function createClient(cookieStore: Awaited<ReturnType<typeof cookies>>): SupabaseClient {
  if (!hasSupabaseCredentials()) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env.local.",
    );
  }

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component u otra ruta sin mutar cookies; el middleware refresca la sesión.
        }
      },
    },
  });
}
