import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { log } from '@/lib/utils/logger';

const PROTECTED_PATHS = ['/account', '/api/users'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  if (!token) {
    log('info', `Unauthorized access (no token): ${pathname}`);

    // API → 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Page → redirect
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  try {
    const payload = verifyToken(token as string);

    // API / SSR
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.id);
    if (payload.role) requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    log('error', 'Invalid JWT in middleware', error);

    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/account/:path*', '/api/users/:path*'],
};
