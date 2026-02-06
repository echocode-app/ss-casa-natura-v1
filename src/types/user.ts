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
  adminSections?: string[];
}

export interface OrderProduct {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images?: string[];
    volume?: number;
    unit?: string;
  } | null;
  quantity: number;
}

export interface Order {
  id: string;
  status: string;
  subtotal?: number;
  shippingPrice?: number;
  totalPrice: number;
  promoCode?: string;
  discount?: number;
  promoDiscount?: number;
  discountAmount?: number;
  createdAt: string;
  products: OrderProduct[];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
