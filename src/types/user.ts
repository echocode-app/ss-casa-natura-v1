export interface User {
  id: string;
  nome?: string;
  cognome?: string;
  name?: string;
  surname?: string;
  email: string;
  phone?: string;
  deliveryAddress?: string;
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
