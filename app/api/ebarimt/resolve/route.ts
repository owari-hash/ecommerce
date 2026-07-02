import { NextResponse } from 'next/server';

const EBARIMT_TIN_URL = 'https://api.ebarimt.mn/api/info/check/getTinInfo';
const EBARIMT_INFO_URL = 'https://api.ebarimt.mn/api/info/check/getInfo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regNo = searchParams.get('regNo') || '';
    if (!regNo || regNo.length !== 7) return NextResponse.json({ found: false }, { status: 400 });

    const tinRes = await fetch(`${EBARIMT_TIN_URL}?regNo=${encodeURIComponent(regNo)}`);
    if (!tinRes.ok) return NextResponse.json({ found: false }, { status: tinRes.status });
    const tinJson = await tinRes.json().catch(() => null);
    const tin = tinJson?.data;
    if (!tin) return NextResponse.json({ found: false });

    // Optionally fetch full company info
    const infoRes = await fetch(`${EBARIMT_INFO_URL}?tin=${encodeURIComponent(tin)}`);
    const infoJson = infoRes.ok ? await infoRes.json().catch(() => null) : null;

    return NextResponse.json({ found: true, tin, info: infoJson?.data ?? null });
  } catch (err: any) {
    return NextResponse.json({ found: false, error: String(err?.message || err) }, { status: 500 });
  }
}
