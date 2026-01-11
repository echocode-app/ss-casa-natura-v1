import { cookies as nextCookies } from 'next/headers';

const COOKIE_NAME = 'token';
const isProduction = process.env.NODE_ENV === 'production';

export const setAuthCookie = async (token: string) => {
  const ck = await nextCookies();
  ck.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
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
