import { NextRequest, NextResponse } from 'next/server';

// Kicks off Google OAuth: redirects the user to Google's consent screen.
// Requires GOOGLE_CLIENT_ID (+ GOOGLE_CLIENT_SECRET for the callback).
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = new URL(request.url).origin;
  if (!clientId) {
    return NextResponse.redirect(`${origin}/account?error=google_not_configured`);
  }
  const redirect = request.nextUrl.searchParams.get('redirect') ?? '/account';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/oauth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: redirect,
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
