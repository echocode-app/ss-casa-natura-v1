import { cookies as nextCookies } from 'next/headers';

const CART_ID_COOKIE = 'cart_session_id';

export async function getCartSessionId(): Promise<string> {
  const ck = await nextCookies();
  const existing = ck.get(CART_ID_COOKIE)?.value;
  if (existing) return existing;

  // Generate new session ID
  const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  await setCartSessionId(newId);
  return newId;
}

export async function setCartSessionId(id: string): Promise<void> {
  const ck = await nextCookies();
  ck.set(CART_ID_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearCartSessionId(): Promise<void> {
  const ck = await nextCookies();
  ck.set(CART_ID_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}
