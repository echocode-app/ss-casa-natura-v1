import {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveFromCartRequest,
  ApplyPromoCodeRequest,
} from '@/types/cart';

const API_BASE = '/api/cart';

export interface CartService {
  getCart(): Promise<Cart>;
  addItem(data: AddToCartRequest): Promise<Cart>;
  updateItem(data: UpdateCartItemRequest): Promise<Cart>;
  removeItem(data: RemoveFromCartRequest): Promise<Cart>;
  clearCart(): Promise<Cart>;
  applyPromoCode(data: ApplyPromoCodeRequest): Promise<Cart>;
  removePromoCode(): Promise<Cart>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Unknown error',
    }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export const cartService: CartService = {
  async getCart(): Promise<Cart> {
    const response = await fetch(API_BASE, {
      method: 'GET',
      credentials: 'include',
    });
    const result = await handleResponse<{
      success: boolean;
      cart?: Cart;
      error?: string;
    }>(response);
    if (!result.success || !result.cart) {
      throw new Error(result.error || 'Failed to get cart');
    }
    return result.cart;
  },

  async addItem(data: AddToCartRequest): Promise<Cart> {
    const response = await fetch(`${API_BASE}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await handleResponse<{
      success: boolean;
      cart?: Cart;
      error?: string;
    }>(response);
    if (!result.success || !result.cart) {
      throw new Error(result.error || 'Failed to add item');
    }
    return result.cart;
  },

  async updateItem(data: UpdateCartItemRequest): Promise<Cart> {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await handleResponse<{
      success: boolean;
      cart?: Cart;
      error?: string;
    }>(response);
    if (!result.success || !result.cart) {
      throw new Error(result.error || 'Failed to update item');
    }
    return result.cart;
  },

  async removeItem(data: RemoveFromCartRequest): Promise<Cart> {
    const response = await fetch(`${API_BASE}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await handleResponse<{
      success: boolean;
      cart?: Cart;
      error?: string;
    }>(response);
    if (!result.success || !result.cart) {
      throw new Error(result.error || 'Failed to remove item');
    }
    return result.cart;
  },

  async clearCart(): Promise<Cart> {
    const response = await fetch(`${API_BASE}/clear`, {
      method: 'POST',
      credentials: 'include',
    });
    const result = await handleResponse<{
      success: boolean;
      cart?: Cart;
      error?: string;
    }>(response);
    if (!result.success || !result.cart) {
      throw new Error(result.error || 'Failed to clear cart');
    }
    return result.cart;
  },

  async applyPromoCode(data: ApplyPromoCodeRequest): Promise<Cart> {
    const response = await fetch(`${API_BASE}/promo/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await handleResponse<{
      success: boolean;
      cart?: Cart;
      error?: string;
    }>(response);
    if (!result.success || !result.cart) {
      throw new Error(result.error || 'Failed to apply promo code');
    }
    return result.cart;
  },

  async removePromoCode(): Promise<Cart> {
    const response = await fetch(`${API_BASE}/promo/remove`, {
      method: 'POST',
      credentials: 'include',
    });
    const result = await handleResponse<{
      success: boolean;
      cart?: Cart;
      error?: string;
    }>(response);
    if (!result.success || !result.cart) {
      throw new Error(result.error || 'Failed to remove promo code');
    }
    return result.cart;
  },
};
