import { AuthUser } from '@/lib/auth/types';

// ================= API Response Types =================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}

// ================= User API Types =================

export interface UserResponse {
  id: string;
  name?: string;
  surname?: string;
  email: string;
  phone?: string;
  address?: string;
  role?: 'user' | 'admin';
  createdAt?: Date | string;
}

export interface UserUpdateRequest {
  nome?: string;
  cognome?: string;
  phone?: string;
  address?: string;
}

export interface RegisterRequest {
  nome: string;
  cognome: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    surname?: string;
    role?: 'user' | 'admin';
  };
}

// ================= Auth Context Types =================

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ================= Error Types =================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrors {
  [key: string]: string[];
}
