import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-host", host);

  // Priority: env var > URL query param > /preview/[store] path segment > Host domain inference
  const envSlug = process.env.TENANT_SLUG ?? "";
  const querySlug = request.nextUrl.searchParams.get("tenant") ?? "";
  const pathname = request.nextUrl.pathname;
  const previewMatch = pathname.match(/^\/preview\/([^/]+)/);
  const pathSlug = previewMatch ? previewMatch[1] : "";

  // Automatically map Vercel preview hostnames to their respective static tenant configurations
  let hostSlug = "";
  const lowercaseHost = host.toLowerCase();
  if (lowercaseHost.includes("commerce-ikhnayd") || lowercaseHost.includes("ikhnayd")) {
    hostSlug = "ikhnayd";
  } else if (lowercaseHost.includes("foodcity")) {
    hostSlug = "foodcity";
  } else if (lowercaseHost.includes("goto-market")) {
    hostSlug = "goto-market";
  }

  const tenantSlug = envSlug || querySlug || pathSlug || hostSlug;
  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
};
