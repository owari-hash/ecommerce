import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value
  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  const res = await fetch(`${apiUrl}/api/users/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  const data = await res.json()

  if (!res.ok) {
    const response = NextResponse.json({ error: 'Session expired' }, { status: 401 })
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('access_token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })

  return response
}
