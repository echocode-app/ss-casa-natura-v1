import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/contact',
  '/api/webhooks/stripe',
  '/api/orders/webhook',
  '/api/docs',
  '/api/health',
];

// Paths that require admin role
const ADMIN_PATHS = ['/api/admin'];

async function verifyToken(
  token: string,
): Promise<{ id: string; email: string; role: string } | null> {
  if (!JWT_SECRET) {
    // console.error('[middleware] JWT_SECRET not defined');
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string; email: string; role: string };
  } catch (error) {
    // console.error(
    //   '[middleware] Token verification failed:',
    //   error instanceof Error ? error.message : 'Unknown error',
    // );
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // console.log('[middleware] No token found for path:', pathname);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify token
  const user = await verifyToken(token);

  if (!user) {
    // console.log('[middleware] Token invalid for path:', pathname);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-email', user.email);
  requestHeaders.set('x-user-role', user.role);

  // For admin paths, check role
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  if (isAdminPath) {
    const allowedRoles = ['developer', 'superadmin', 'admin'];
    if (!user.role || !allowedRoles.includes(user.role)) {
      // console.log('[middleware] User role not allowed:', user.role);
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/api/:path*',
};
