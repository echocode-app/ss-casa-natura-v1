import { JWTPayload } from 'jose';

export interface JwtPayload extends JWTPayload {
  id: string;
  email: string;
  role?: 'user' | 'admin' | 'superadmin' | 'developer';
}

export interface AuthUser {
  id: string;
  email: string;
  role?: 'user' | 'admin' | 'superadmin' | 'developer';
  adminSections?: string[];
}
