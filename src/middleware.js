import { NextResponse } from "next/server";

// Better Auth names the cookie "__Secure-better-auth.session_token" on HTTPS (production)
// and "better-auth.session_token" on plain HTTP (local), so accept both.
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

// Cheap first gate: no session cookie -> Sign In. Real role checks happen in the dashboard
// layout and, authoritatively, on the Express API.
export function middleware(request) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.get(name)?.value);
  if (!hasSession) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile", "/payment/:path*", "/services/:id"],
};