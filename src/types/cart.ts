// ================= Cart Item Types =================

export interface CartItemBase {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  title: string;
  imageSrc?: string;
  price: number;
  volume?: number;
  unit?: string;
  quantity: number;
}

export interface CartItem extends CartItemBase {
  // Computed fields
  totalPrice: number;
}

// Cart item as stored in MongoDB (has _id, and optionally id)
export interface CartItemDB extends Omit<CartItemBase, 'id'> {
  _id?: string;
  id?: string;
  totalPrice: number;
}

// ================= Cart Types =================

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  discount?: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// ================= Cart API Types =================

export interface AddToCartRequest {
  productId: string;
  variantId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  itemId: string;
}

export interface ApplyPromoCodeRequest {
  promoCode: string;
  email?: string;
}

export interface RemovePromoCodeRequest {}

// ================= Cart Types =================

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  discount?: number;
  promoCode?: string;
  promoDiscount?: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemResponse {
  item: CartItem;
}

export interface ApiCartResponse {
  success: boolean;
  cart?: Cart;
  error?: string;
}

export interface ApiCartItemResponse {
  success: boolean;
  item?: CartItem;
  error?: string;
}

// ================= Cart Item UI Type (for display) =================

export interface CartItemUI {
  id: string;
  slug: string;
  title: string;
  imageSrc?: string;
  price: number;
  volume?: number;
  unit?: string;
  quantity: number;
}

// Helper to convert CartItem to CartItemUI
export function cartItemToUI(item: CartItem): CartItemUI {
  return {
    id: item.id,
    slug: item.slug || '',
    title: item.title,
    imageSrc: item.imageSrc,
    price: item.price,
    volume: item.volume,
    unit: item.unit,
    quantity: item.quantity,
  };
}

// Helper to convert CartItemUI to CartItem
export function cartItemFromUI(item: CartItemUI, productId: string, variantId: string): CartItem {
  return {
    ...item,
    productId,
    variantId,
    totalPrice: item.price * item.quantity,
  };
}
