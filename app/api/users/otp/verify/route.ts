import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  const body = await request.json()
  const tenantId = request.headers.get('x-tenant-id') ?? ''

  const res = await fetch(`${apiUrl}/api/users/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) return NextResponse.json(data, { status: res.status })

  const cookieStore = await cookies()
  cookieStore.set('access_token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })
  cookieStore.set('refresh_token', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return NextResponse.json({ user: data.user })
}
