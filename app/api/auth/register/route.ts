import { NextRequest, NextResponse } from 'next/server'
import { fetchTenantConfig } from '../../../lib/tenantConfig'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  const host = request.headers.get('x-tenant-host') ?? request.headers.get('host') ?? 'localhost'
  const tenantSlug = request.headers.get('x-tenant-slug')
  const config = await fetchTenantConfig(host, tenantSlug)
  const tenantId = config?.tenantId ?? ''

  const res = await fetch(`${apiUrl}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: data.error ?? 'Registration failed' }, { status: res.status })
  }

  const response = NextResponse.json({ user: data.user })

  response.cookies.set('access_token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })
  response.cookies.set('refresh_token', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
