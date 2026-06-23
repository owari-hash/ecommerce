import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Front QPay Invoice] Received request body:', JSON.stringify(body, null, 2));

    const { tenantId, ...rest } = body;
    const url = tenantId ? `${API}/api/qpay/invoice?tenantId=${tenantId}` : `${API}/api/qpay/invoice`;
    console.log('[Front QPay Invoice] Forwarding to URL:', url, 'with body:', JSON.stringify(rest, null, 2));

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
    });

    console.log('[Front QPay Invoice] Downstream response status:', res.status);
    const data = await res.json();
    console.log('[Front QPay Invoice] Downstream response data:', JSON.stringify(data, null, 2));

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[Front QPay Invoice] Error during processing:', error?.message || error);
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}
