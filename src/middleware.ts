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

  // Protected routes - require authentication
  const protectedPaths = ["/dashboard", "/parking"];
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Redirect unauthenticated users to login
  if (isProtectedPath && !isAuthed) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    const redirect = NextResponse.redirect(login);
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  // Protect API routes
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
    "/dashboard/:path*",
    "/parking/:path*",
    "/api/parking/:path*",
    "/api/payments/:path*",
  ],
};
