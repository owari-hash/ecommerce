import { NextRequest, NextResponse } from 'next/server';
import { fetchTenantConfig } from '../../../../../lib/tenantConfig';

const isProd = process.env.NODE_ENV === 'production';

function setSessionCookies(res: NextResponse, accessToken: string, refreshToken: string) {
  res.cookies.set('access_token', accessToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 60 * 15, path: '/' });
  res.cookies.set('refresh_token', refreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
}

// Google redirects here with ?code. We exchange it, read the verified email,
// upsert the user on the backend, set session cookies, and return to the app.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '/account';
  const safeRedirect = state.startsWith('/') && !state.startsWith('//') ? state : '/account';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/account?error=google_oauth`);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/oauth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error('token exchange failed');

    const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const info = await infoRes.json();
    if (!info.email) throw new Error('no email');

    const host = request.headers.get('x-tenant-host') ?? request.headers.get('host') ?? 'localhost';
    const tenantSlug = request.headers.get('x-tenant-slug');
    const config = await fetchTenantConfig(host, tenantSlug);
    const tenantId = config?.tenantId ?? '';

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const upRes = await fetch(`${apiUrl}/api/users/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(tenantId ? { 'x-tenant-id': tenantId } : {}) },
      body: JSON.stringify({ email: info.email, firstName: info.given_name, lastName: info.family_name, provider: 'google' }),
    });
    const data = await upRes.json();
    if (!upRes.ok || !data.accessToken) throw new Error(data.error || 'upsert failed');

    const res = NextResponse.redirect(`${origin}${safeRedirect}`);
    setSessionCookies(res, data.accessToken, data.refreshToken);
    return res;
  } catch {
    return NextResponse.redirect(`${origin}/account?error=google_oauth`);
  }
}
