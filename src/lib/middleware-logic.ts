import { NextRequest, NextResponse } from "next/server";
import { RedirectService } from "./redirect-service";

export async function handleRedirects(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip internal paths and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return null;
  }

  const redirect = await RedirectService.getRedirect(pathname);

  if (redirect) {
    const url = req.nextUrl.clone();
    url.pathname = redirect.target_url;
    return NextResponse.redirect(url, redirect.status_code);
  }

  return null;
}
