import { NextRequest, NextResponse } from "next/server";
import { handleRedirects } from "./lib/middleware-logic";

export async function middleware(request: NextRequest) {
  const redirectResponse = await handleRedirects(request);
  if (redirectResponse) {
    return redirectResponse;
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
