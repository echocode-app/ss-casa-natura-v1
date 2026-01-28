import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

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

  // Admin routes (/admin/*) and Admin API routes (/api/admin/*, /api/mailchimp/*) - check JWT cookie and role
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/mailchimp')
  ) {
    const authCookie = request.cookies.get('token');
    if (!authCookie) {
      // Для UI-адмінки — редірект на логін, для API — 401
      if (pathname.startsWith('/admin')) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    try {
      const payload = await verifyToken(authCookie.value);
      const allowedRoles = ['developer', 'superadmin', 'admin'];
      if (!payload.role || !allowedRoles.includes(payload.role)) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
      // Додаємо user info у заголовки для SSR/API (якщо потрібно)
      response.headers.set('x-user-id', payload.id);
      response.headers.set('x-user-email', payload.email);
      response.headers.set('x-user-role', payload.role);
      return response;
    } catch {
      // Токен невалідний або прострочений
      if (pathname.startsWith('/admin')) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
