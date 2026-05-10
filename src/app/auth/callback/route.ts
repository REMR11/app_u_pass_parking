import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, hasSupabaseCredentials } from "@/utils/supabase/server";

/**
 * Intercambia el código OAuth/PKCE por sesión (Azure, Google, etc. configurados en Supabase).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/parking";

  if (!hasSupabaseCredentials()) {
    return NextResponse.redirect(new URL("/login?error=config", url.origin));
  }

  if (code) {
    const supabase = createClient(await cookies());
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectTo = next.startsWith("/") ? `${url.origin}${next}` : `${url.origin}/parking`;
      return NextResponse.redirect(redirectTo);
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
