import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityHeaders } from './src/lib/security/headers';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply full security headers (incl. CSP) consistently in dev/prod.
  // next.config.ts headers() should also set these, but middleware is the most reliable place.
  for (const header of securityHeaders) {
    response.headers.set(header.key, header.value);
  }

  return response;
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
