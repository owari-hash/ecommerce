import { NextRequest, NextResponse } from 'next/server'
import { fetchTenantConfig } from '../../../lib/tenantConfig'

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  const accessToken = request.cookies.get('access_token')?.value
  if (!accessToken) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  }

  const host = request.headers.get('x-tenant-host') ?? request.headers.get('host') ?? 'localhost'
  const tenantSlug = request.headers.get('x-tenant-slug')
  const config = await fetchTenantConfig(host, tenantSlug)
  const tenantId = config?.tenantId ?? ''

  const res = await fetch(`${apiUrl}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function PATCH(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  const accessToken = request.cookies.get('access_token')?.value
  if (!accessToken) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  }

  const host = request.headers.get('x-tenant-host') ?? request.headers.get('host') ?? 'localhost'
  const tenantSlug = request.headers.get('x-tenant-slug')
  const config = await fetchTenantConfig(host, tenantSlug)
  const tenantId = config?.tenantId ?? ''

  const body = await request.json()
  const res = await fetch(`${apiUrl}/api/users/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
