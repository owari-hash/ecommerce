import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regNo = searchParams.get('regNo') || '';
    if (!regNo || regNo.length !== 7) return NextResponse.json({ found: false }, { status: 400 });

    // Proxy through the Mongolian IP server to bypass Vercel IP geo-blocking by api.ebarimt.mn
    const res = await fetch(`https://pos.zevtabs.mn/api/tatvaraasBaiguullagaAvya/${encodeURIComponent(regNo)}`);
    if (!res.ok) return NextResponse.json({ found: false }, { status: res.status });
    
    const data = await res.json().catch(() => null);
    if (!data || !data.found) return NextResponse.json({ found: false });

    return NextResponse.json({
      found: true,
      tin: data.tin,
      info: {
        name: data.name
      }
    });
  } catch (err: any) {
    return NextResponse.json({ found: false, error: String(err?.message || err) }, { status: 500 });
  }
}
