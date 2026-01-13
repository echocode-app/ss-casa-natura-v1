export interface User {
  id: string;
  nome?: string;
  cognome?: string;
  name?: string;
  surname?: string;
  email: string;
  phone?: string;
  deliveryAddress?: string;
  role?: 'user' | 'admin' | 'superadmin' | 'developer';
}

export interface OrderProduct {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images?: string[];
  } | null;
  quantity: number;
}

export interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  products: OrderProduct[];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
