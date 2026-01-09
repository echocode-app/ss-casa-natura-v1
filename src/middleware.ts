import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { log } from '@/lib/utils/logger';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/account') || pathname.startsWith('/api/users')) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      log('info', `Unauthorized access (no token): ${pathname}`);
      return pathname.startsWith('/api')
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/', req.url));
    }

    try {
      const payload = verifyToken(token);
      const headers = new Headers(req.headers);
      headers.set('x-user-id', payload.id);
      if (payload.role) headers.set('x-user-role', payload.role);

      return NextResponse.next({ request: { headers } });
    } catch (err) {
      log('error', 'Invalid JWT in middleware', err);
      return pathname.startsWith('/api')
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/api/users/:path*'],
};
