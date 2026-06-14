import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  // Forward the httpOnly access_token cookie as Bearer
  const accessToken = request.cookies.get('access_token')?.value
  if (!accessToken) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  }

  // Forward tenant context header if present
  const tenantId = request.headers.get('x-tenant-id') ?? ''

  const res = await fetch(`${apiUrl}/api/users/orders`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
