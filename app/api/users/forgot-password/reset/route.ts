import { NextRequest, NextResponse } from 'next/server'
import { fetchTenantConfig } from '../../../../lib/tenantConfig'

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  const body = await request.json()
  
  let tenantId = request.headers.get('x-tenant-id') ?? ''
  if (!tenantId) {
    const host = request.headers.get('x-tenant-host') ?? request.headers.get('host') ?? 'localhost'
    const tenantSlug = request.headers.get('x-tenant-slug')
    const config = await fetchTenantConfig(host, tenantSlug)
    tenantId = config?.tenantId ?? ''
  }

  const res = await fetch(`${apiUrl}/api/users/forgot-password/reset`, {
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
