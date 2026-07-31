import { NextRequest, NextResponse } from 'next/server'

function extractToken(request: NextRequest): string | undefined {
  const cookieToken = request.cookies.get('access_token')?.value;
  if (cookieToken) return cookieToken;
  const authHeader = request.headers.get('Authorization');
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }
  return undefined;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  const accessToken = extractToken(request)
  if (!accessToken) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  }
  const { orderNumber } = await params
  const res = await fetch(`${apiUrl}/api/users/ebarimt/${orderNumber}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
