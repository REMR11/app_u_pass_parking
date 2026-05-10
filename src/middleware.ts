import { updateSession } from "@/utils/supabase/middleware";
import { hasSupabaseCredentials } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

export async function middleware(request: NextRequest) {
  if (!hasSupabaseCredentials()) {
    return NextResponse.next();
  }

  const { response: supabaseResponse, user } = await updateSession(request);
  const isAuthed = !!user;

  const { pathname } = request.nextUrl;

  const protectedPaths = ["/dashboard", "/parking"];
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isProtectedPath && !isAuthed) {
    const login = new URL("/login", request.nextUrl.origin);
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
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/parking/:path*",
    "/api/parking/:path*",
    "/api/payments/:path*",
    "/auth/callback",
  ],
};
