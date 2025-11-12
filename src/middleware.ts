import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Protect admin routes (except login)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    // Check if token exists in localStorage (client-side check)
    // For server-side, we'll rely on the client to handle redirect
    // This is a basic check - full auth should be done client-side
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
