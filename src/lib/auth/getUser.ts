import { getAuthCookie } from './cookies';
import { verifyToken } from './jwt';
import { AuthUser } from './types';

export const getUser = async (): Promise<AuthUser | null> => {
  try {
    const token = await getAuthCookie();
    if (!token) return null;

    const payload = verifyToken(token);

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
};
