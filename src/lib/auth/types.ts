export interface JwtPayload {
  id: string;
  email: string;
  role?: 'user' | 'admin';
}

export interface AuthUser {
  id: string;
  email: string;
  role?: 'user' | 'admin';
}
