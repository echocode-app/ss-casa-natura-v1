'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItemUI, cartItemToUI } from '@/types/cart';
import { cartService } from '@/lib/services/cart';
import { useAuth } from '@/components/layout/AuthContext';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';

const GUEST_CART_KEY = 'guest_cart_v1';
const GUEST_CART_TTL = 1000 * 60 * 60 * 24 * 7;

type GuestCart = {
  items: CartItemUI[];
  promoCode?: string;
  promoDiscount?: number;
  ts: number;
};

function loadGuestCart(): GuestCart | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(GUEST_CART_KEY);
  if (!raw) return null;

  try {
    const parsed: GuestCart = JSON.parse(raw);
    if (Date.now() - parsed.ts > GUEST_CART_TTL) {
      localStorage.removeItem(GUEST_CART_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(GUEST_CART_KEY);
    return null;
  }
}

function saveGuestCart(cart: Omit<GuestCart, 'ts'>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify({ ...cart, ts: Date.now() }));
}

function clearGuestCart() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
}

interface CartContextType {
  items: CartItemUI[];
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  addItem: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => Promise<void>;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  promoCode?: string;
  promoDiscount?: number;
}

const CartContext = createContext<CartContextType>(null as any);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();

  const [items, setItems] = useState<CartItemUI[]>([]);
  const [promoCode, setPromoCode] = useState<string | undefined>();
  const [promoDiscount, setPromoDiscount] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Initialize cart state

  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      setIsInitializing(true);
      setError(null);

      try {
        if (user) {
          const cart = await cartService.getCart();
          setItems(cart.items.map(cartItemToUI));
          setPromoCode(cart.promoCode);
          setPromoDiscount(cart.promoDiscount);

          const guest = loadGuestCart();
          if (guest?.items?.length) {
            clearGuestCart();
          }
        } else {
          const guest = loadGuestCart();
          if (guest) {
            setItems(guest.items || []);
            setPromoCode(guest.promoCode);
            setPromoDiscount(guest.promoDiscount);
          } else {
            setItems([]);
            setPromoCode(undefined);
            setPromoDiscount(undefined);
          }
        }
      } catch {
        setError('Failed to load cart');
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [authLoading, user]);

  // 📌 Persist guest cart locally
  useEffect(() => {
    if (isInitializing) return;
    if (!user) {
      saveGuestCart({ items, promoCode, promoDiscount });
    }
  }, [items, promoCode, promoDiscount, isInitializing, user]);

  const addItem = useCallback(
    async (productId: string, variantId: string, quantity = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        if (user) {
          const cart = await cartService.addItem({ productId, variantId, quantity });
          setItems(cart.items.map(cartItemToUI));
          setPromoCode(cart.promoCode);
          setPromoDiscount(cart.promoDiscount);
        } else {
          // 📌 Guest cart: read product data from mock
          const product = PRODUCTS_MOCK.find((p) => p.id === productId);
          if (!product) {
            setError('Product not found');
            return;
          }

          const variant = product.variants?.find((v) => v.id === variantId);
          if (!variant) {
            setError('Variant not found');
            return;
          }

          const price = variant.priceModifier
            ? product.price + variant.priceModifier
            : product.price;
          const imageSrc = product.images?.[0]?.src || '/images/home/product.png';

          const existingItemIndex = items.findIndex(
            (item) => item.id === `${productId}-${variantId}`,
          );

          if (existingItemIndex >= 0) {
            setItems((prev) =>
              prev.map((item, idx) =>
                idx === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            );
          } else {
            const newItem: CartItemUI = {
              id: `${productId}-${variantId}`,
              title: product.title,
              imageSrc,
              price,
              volume: variant.volume,
              unit: variant.unit,
              quantity,
            };
            setItems((prev) => [...prev, newItem]);
          }
        }
      } catch {
        setError('Failed to add item');
      } finally {
        setIsLoading(false);
      }
    },
    [user, items],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      setIsLoading(true);
      setError(null);

      try {
        if (user) {
          const cart = await cartService.updateItem({ itemId, quantity });
          setItems(cart.items.map(cartItemToUI));
          setPromoCode(cart.promoCode);
          setPromoDiscount(cart.promoDiscount);
        } else {
          if (quantity <= 0) {
            setItems((prev) => prev.filter((i) => i.id !== itemId));
          } else {
            setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
          }
        }
      } catch {
        setError('Failed to update item');
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (user) {
          const cart = await cartService.removeItem({ itemId });
          setItems(cart.items.map(cartItemToUI));
          setPromoCode(cart.promoCode);
          setPromoDiscount(cart.promoDiscount);
        } else {
          setItems((prev) => prev.filter((i) => i.id !== itemId));
        }
      } catch {
        setError('Failed to remove item');
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        await cartService.clearCart();
      } else {
        clearGuestCart();
      }
      setItems([]);
      setPromoCode(undefined);
      setPromoDiscount(undefined);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const applyPromoCode = useCallback(
    async (code: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!user) return;
        const cart = await cartService.applyPromoCode({ promoCode: code });
        setItems(cart.items.map(cartItemToUI));
        setPromoCode(cart.promoCode);
        setPromoDiscount(cart.promoDiscount);
      } catch {
        setError('Failed to apply promo code');
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  const removePromoCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) return;
      const cart = await cartService.removePromoCode();
      setItems(cart.items.map(cartItemToUI));
      setPromoCode(cart.promoCode);
      setPromoDiscount(cart.promoDiscount);
    } catch {
      setError('Failed to remove promo code');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getItemCount = useCallback(() => items.reduce((t, i) => t + i.quantity, 0), [items]);

  const getSubtotal = useCallback(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items],
  );

  const getTotal = useCallback(
    () => getSubtotal() - (promoDiscount || 0),
    [getSubtotal, promoDiscount],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        isInitializing,
        error,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        applyPromoCode,
        removePromoCode,
        getItemCount,
        getSubtotal,
        getTotal,
        promoCode,
        promoDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
