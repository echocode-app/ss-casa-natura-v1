import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy
 *
 * - /admin/* - developer, superadmin, admin
 * - /api/admin/* - API
 * - /api/mailchimp/* - Endpoints Mailchimp
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('auth-token');

    if (!authCookie) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/mailchimp')) {
    const apiSecret = request.headers.get('authorization');

    // API_SECRET_KEY token Bearer
    if (!apiSecret) {
      return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/mailchimp/:path*'],
};
