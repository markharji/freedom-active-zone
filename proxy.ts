// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Special case: visiting /admin (login page)
  if (pathname === "/admin") {
    if (token) {
      try {
        jwt.verify(token, JWT_SECRET);
        // Already logged in → redirect to /admin/facilities
        const dashboardUrl = new URL("/admin/home", req.url);
        return NextResponse.redirect(dashboardUrl);
      } catch {
        // Invalid token → stay on /admin to login
        return NextResponse.next();
      }
    }
    return NextResponse.next(); // No token → show login page
  }

  // Protect all other admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/admin", req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/admin", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Public route → allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
