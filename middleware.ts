import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityHeaders } from './src/lib/security/headers';

export function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const pathname = request.nextUrl.pathname;
    const skipCsp = pathname.startsWith('/admin') || pathname.startsWith('/api');

    // Apply security headers consistently in dev/prod.
    for (const header of securityHeaders) {
      if (skipCsp && header.key === 'Content-Security-Policy') continue;
      response.headers.set(header.key, header.value);
    }

    return response;
  } catch (error) {
    // Fail open: better to serve the page than to 500 the whole route.
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
