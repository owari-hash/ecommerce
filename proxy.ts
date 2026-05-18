import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  // Forward host as a custom header so Server Components can read it via headers()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-host', host)

  // Forward tenant query parameter as x-tenant-slug header
  const tenantSlug = request.nextUrl.searchParams.get('tenant')
  if (tenantSlug) {
    requestHeaders.set('x-tenant-slug', tenantSlug)
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)'],
}
