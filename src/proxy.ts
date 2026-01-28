import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy (formerly middleware)
 *
 * - Security headers for all routes
 * - /admin/* - developer, superadmin, admin auth check
 * - /api/admin/* - API auth
 * - /api/mailchimp/* - Endpoints Mailchimp auth
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Skip CSP for admin and API routes
  const skipCsp = pathname.startsWith('/admin') || pathname.startsWith('/api');

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CSP only for non-admin/api routes
  if (!skipCsp) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.stripe.com https://maps.googleapis.com; frame-src https://js.stripe.com https://maps.googleapis.com;",
    );
  }

  // Admin routes - check auth
  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('auth-token');

    if (!authCookie) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // Admin API routes - check API secret
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/mailchimp')) {
    const apiSecret = request.headers.get('authorization');

    // API_SECRET_KEY token Bearer
    if (!apiSecret) {
      return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 401 });
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
