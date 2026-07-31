import { NextRequest, NextResponse } from 'next/server'
import { fetchTenantConfig } from '../../../lib/tenantConfig'

function extractToken(request: NextRequest): string | undefined {
  const cookieToken = request.cookies.get('access_token')?.value;
  if (cookieToken) return cookieToken;
  const authHeader = request.headers.get('Authorization');
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  const accessToken = extractToken(request)
  if (!accessToken) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  }

  // Forward tenant context header if present
  let tenantId = request.headers.get('x-tenant-id') ?? ''
  if (!tenantId) {
    const host = request.headers.get('x-tenant-host') ?? request.headers.get('host') ?? 'localhost'
    const tenantSlug = request.headers.get('x-tenant-slug')
    const config = await fetchTenantConfig(host, tenantSlug)
    tenantId = config?.tenantId ?? ''
  }

  const res = await fetch(`${apiUrl}/api/users/orders`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
