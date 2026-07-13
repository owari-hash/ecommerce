import { NextRequest, NextResponse } from 'next/server';
import { fetchTenantConfig } from '../../../../../lib/tenantConfig';

const isProd = process.env.NODE_ENV === 'production';

function setSessionCookies(res: NextResponse, accessToken: string, refreshToken: string) {
  res.cookies.set('access_token', accessToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 60 * 15, path: '/' });
  res.cookies.set('refresh_token', refreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '/account';
  const safeRedirect = state.startsWith('/') && !state.startsWith('//') ? state : '/account';

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!code || !appId || !appSecret) {
    return NextResponse.redirect(`${origin}/account?error=facebook_oauth`);
  }

  try {
    const redirectUri = `${origin}/api/auth/oauth/facebook/callback`;
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(appSecret)}&code=${encodeURIComponent(code)}`,
    );
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error('token exchange failed');

    const infoRes = await fetch(
      `https://graph.facebook.com/me?fields=email,first_name,last_name&access_token=${encodeURIComponent(token.access_token)}`,
    );
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
      body: JSON.stringify({ email: info.email, firstName: info.first_name, lastName: info.last_name, provider: 'facebook' }),
    });
    const data = await upRes.json();
    if (!upRes.ok || !data.accessToken) throw new Error(data.error || 'upsert failed');

    const res = NextResponse.redirect(`${origin}${safeRedirect}`);
    setSessionCookies(res, data.accessToken, data.refreshToken);
    return res;
  } catch {
    return NextResponse.redirect(`${origin}/account?error=facebook_oauth`);
  }
}
