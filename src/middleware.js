import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Cheap first gate: no session cookie -> Sign In. Real role checks happen in the dashboard
// layout and, authoritatively, on the Express API.
export function middleware(request) {
  if (!getSessionCookie(request)) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile", "/payment/:path*", "/services/:id"],
};
