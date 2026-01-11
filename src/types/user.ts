export interface User {
  id: string;
  nome?: string;
  cognome?: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
  };
}

export interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
