import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantId, ...rest } = body;
  const url = tenantId ? `${API}/api/qpay/invoice?tenantId=${tenantId}` : `${API}/api/qpay/invoice`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rest),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
