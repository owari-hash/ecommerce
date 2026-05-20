import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-host", host);

  // Priority: env var (hard-wired deployment) > URL query param (?tenant=slug)
  // No cookies — cookies would lock a browser session to one tenant.
  const envSlug = process.env.TENANT_SLUG ?? "";
  const querySlug = request.nextUrl.searchParams.get("tenant") ?? "";

  const tenantSlug = envSlug || querySlug;
  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
};
