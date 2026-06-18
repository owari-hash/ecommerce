import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const host = request.headers.get('x-tenant-host') ?? request.headers.get('host') ?? '';
  const res = await fetch(`${API}/api/qpay/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-tenant-host': host },
    body: JSON.stringify(body),
  });
  //response
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
