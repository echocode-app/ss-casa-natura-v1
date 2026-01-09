import { JWTPayload } from 'jose';

export interface JwtPayload extends JWTPayload {
  id: string;
  email: string;
  role?: 'user' | 'admin';
}

export interface AuthUser {
  id: string;
  email: string;
  role?: 'user' | 'admin';
}
