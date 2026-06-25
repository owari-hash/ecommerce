import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  const body = await request.json()
  const tenantId = request.headers.get('x-tenant-id') ?? ''

  const res = await fetch(`${apiUrl}/api/users/otp/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
