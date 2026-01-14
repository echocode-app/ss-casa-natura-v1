import { cookies as nextCookies } from 'next/headers';

const COOKIE_NAME = 'token';

export const setAuthCookie = async (token: string) => {
  const ck = await nextCookies();
  ck.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true, // Always secure, even in dev (use HTTPS locally or accept cookies in dev)
    sameSite: 'strict', // Strict CSRF protection
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
};

export const getAuthCookie = async () => {
  const ck = await nextCookies();
  return ck.get(COOKIE_NAME)?.value;
};

export const clearAuthCookie = async () => {
  const ck = await nextCookies();
  ck.set(COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
};
