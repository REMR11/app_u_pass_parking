import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
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
    return NextResponse.redirect(login);
  }

  // Protect API routes
  if (pathname.startsWith("/api/parking") && !isAuthed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (pathname.startsWith("/api/payments") && !isAuthed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/parking/:path*",
    "/api/parking/:path*",
    "/api/payments/:path*",
  ],
};
