import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./src/auth/verifyJWT";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("jwt");
  const payload = token ? await verifyJWT(token.value) : null;

  if (!request.nextUrl.pathname.startsWith("/auth")) {
    if (!payload) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/auth") {
    if (payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (e.g. /images, /fonts)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
  runtime: "nodejs",
};
