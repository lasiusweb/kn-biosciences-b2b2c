import { NextRequest, NextResponse } from "next/server";
import { handleRedirects } from "./lib/middleware-logic";

export async function middleware(request: NextRequest) {
  // Handle redirects
  const redirectResponse = await handleRedirects(request);
  if (redirectResponse) {
    return redirectResponse;
  }

  return NextResponse.next();
}

// Configuration for matching
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
