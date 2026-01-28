import { getAuthCookie } from './cookies';
import { verifyToken } from './jwt';
import { AuthUser } from './types';
import { NextRequest } from 'next/server';

export const getUser = async (): Promise<AuthUser | null> => {
  try {
    const token = await getAuthCookie();

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    // Log the actual error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // console.error('[getUser] Token verification failed:', errorMessage);
    return null;
  }
};

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Check for user ID in request headers (set by middleware)
  const userId = request.headers.get('x-user-id');
  if (userId) {
    console.log('[getUserIdFromRequest] Found user ID in header:', userId);
    return userId;
  }

  // Fallback: check auth cookie
  const user = await getUser();
  return user?.id || null;
}
