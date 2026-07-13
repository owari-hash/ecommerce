import { NextRequest, NextResponse } from 'next/server';

// Kicks off Facebook OAuth. Requires FACEBOOK_APP_ID (+ FACEBOOK_APP_SECRET for the callback).
export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID;
  const origin = new URL(request.url).origin;
  if (!appId) {
    return NextResponse.redirect(`${origin}/account?error=facebook_not_configured`);
  }
  const redirect = request.nextUrl.searchParams.get('redirect') ?? '/account';
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: `${origin}/api/auth/oauth/facebook/callback`,
    response_type: 'code',
    scope: 'email public_profile',
    state: redirect,
  });
  return NextResponse.redirect(`https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`);
}
