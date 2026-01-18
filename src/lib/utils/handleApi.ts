import { NextResponse } from 'next/server';
import { logError } from '@/lib/utils/logger';
import {
  CSRF_COOKIE_NAME,
  generateCsrfToken,
  requiresCsrfProtection,
  validateCsrfToken,
} from '@/lib/security/csrf';

const CSRF_EXEMPT_PREFIXES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/contact',
  '/api/webhooks/stripe',
  '/api/orders/webhook',
];

function isCsrfExempt(req: Request): boolean {
  const path = new URL(req.url).pathname;
  return CSRF_EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

function ensureCsrfCookie(req: Request, res: Response): Response {
  const hasCsrfCookie = Boolean(getCookieValue(req.headers.get('cookie'), CSRF_COOKIE_NAME));
  if (hasCsrfCookie) return res;

  const existingSetCookie = res.headers.get('set-cookie');
  if (existingSetCookie?.includes(`${CSRF_COOKIE_NAME}=`)) return res;

  const token = generateCsrfToken();
  const cookie = `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

  if (res instanceof NextResponse) {
    res.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return res;
  }

  const headers = new Headers(res.headers);
  headers.append('Set-Cookie', cookie);
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

export const handleApi = <Req extends Request>(
  handler: (req: Req, context?: any) => Promise<Response>,
) => {
  return async (req: Req, context?: any) => {
    try {
      if (requiresCsrfProtection(req.method) && !isCsrfExempt(req) && !validateCsrfToken(req)) {
        const res = NextResponse.json({ error: 'CSRF token validation failed' }, { status: 403 });
        return ensureCsrfCookie(req, res);
      }

      const res = await handler(req, context);
      return ensureCsrfCookie(req, res);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      logError('[api] unhandled error', error);
      const safeMessage = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message;
      const res = NextResponse.json({ error: safeMessage }, { status: 500 });
      return ensureCsrfCookie(req, res);
    }
  };
};
