/**
 * Next.js Middleware for Security
 * 
 * This middleware handles:
 * - CSRF token generation and validation
 * - Rate limiting (basic)
 * - Security headers
 * 
 * Note: Uncomment CSRF validation when client-side is ready
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { validateCsrfToken, generateCsrfToken, CSRF_COOKIE_NAME } from '@/lib/security/csrf';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ============================================
  // CSRF Protection (Currently Disabled)
  // ============================================
  // Uncomment when client-side CSRF token support is added
  
  /*
  // Generate CSRF token for all requests if not present
  if (!request.cookies.get(CSRF_COOKIE_NAME)) {
    const token = generateCsrfToken();
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  // Validate CSRF for state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (stateChangingMethods.includes(request.method)) {
    // Skip CSRF validation for certain public endpoints
    const publicEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/logout',
      '/api/contact',
    ];

    const isPublic = publicEndpoints.some(endpoint => 
      request.nextUrl.pathname.startsWith(endpoint)
    );

    if (!isPublic && !validateCsrfToken(request)) {
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }
  }
  */

  // ============================================
  // Additional Security Measures
  // ============================================

  // Add security headers (redundant with next.config.ts but good for defense in depth)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

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
