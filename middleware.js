import { NextResponse } from "next/server";
import { AUTH_COOKIE, isValidSession } from "./lib/auth";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_next");

  if (isPublic) return NextResponse.next();

  const session = request.cookies.get(AUTH_COOKIE)?.value;
  if (!isValidSession(session)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
