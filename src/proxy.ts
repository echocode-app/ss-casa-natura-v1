import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { securityHeaders } from '@/lib/security/headers';

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
  const headersToApply = skipCsp
    ? securityHeaders.filter((h) => h.key !== 'Content-Security-Policy')
    : securityHeaders;
  for (const header of headersToApply) {
    response.headers.set(header.key, header.value);
  }

  // Admin routes (/admin/*) and Admin API routes (/api/admin/*, /api/mailchimp/*) - check JWT cookie and role
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/mailchimp')
  ) {
    const authCookie = request.cookies.get('token');
    if (!authCookie) {
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
      response.headers.set('x-user-id', payload.id);
      response.headers.set('x-user-email', payload.email);
      response.headers.set('x-user-role', payload.role);
      return response;
    } catch {
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
