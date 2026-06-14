import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  const accessToken = request.cookies.get('access_token')?.value
  if (!accessToken) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  }

  const res = await fetch(`${apiUrl}/api/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
