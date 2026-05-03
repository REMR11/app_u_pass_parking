import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;

  if (pathname.startsWith("/dashboard") && !isAuthed) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/api/parking") && !isAuthed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (pathname.startsWith("/api/payments") && !isAuthed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/parking/:path*", "/api/payments/:path*"],
};
