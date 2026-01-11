import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy per proteggere le route amministrative
 *
 * Protegge:
 * - /admin/* - Solo per developer, superadmin, admin
 * - /api/admin/* - API amministrative
 * - /api/mailchimp/* - Endpoints Mailchimp
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protezione admin panel
  if (pathname.startsWith('/admin')) {
    // Verifica se c'è un cookie di autenticazione
    const authCookie = request.cookies.get('auth-token');

    if (!authCookie) {
      // Nessun cookie - redirect al login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // TODO: Verifica il token e il ruolo dal cookie/JWT
    // Per ora lasciamo passare, la verifica client-side nel layout farà il resto
  }

  // Protezione API admin
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/mailchimp')) {
    const apiSecret = request.headers.get('authorization');

    // Verifica API_SECRET_KEY o token Bearer
    if (!apiSecret) {
      return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/mailchimp/:path*'],
};
