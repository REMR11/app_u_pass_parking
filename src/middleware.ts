import { auth } from "@/auth";
import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";

/** Propaga cookies de Supabase (p. ej. sesión refrescada) a otra respuesta (redirect / JSON). */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

export default auth(async (req) => {
  const supabaseResponse = await updateSession(req);

  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;

  if (pathname.startsWith("/dashboard") && !isAuthed) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    const redirect = NextResponse.redirect(login);
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  if (pathname.startsWith("/api/parking") && !isAuthed) {
    const res = NextResponse.json({ error: "No autorizado" }, { status: 401 });
    copyCookies(supabaseResponse, res);
    return res;
  }

  if (pathname.startsWith("/api/payments") && !isAuthed) {
    const res = NextResponse.json({ error: "No autorizado" }, { status: 401 });
    copyCookies(supabaseResponse, res);
    return res;
  }

  return supabaseResponse;
});

export const config = {
  matcher: [
    /*
     * Ejecutar Supabase session refresh en casi todas las rutas (recomendación oficial).
     * Excluye estáticos e imágenes optimizadas.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
