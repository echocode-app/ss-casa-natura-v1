'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ApplyPromoCodeRequest, CartItemUI, cartItemToUI } from '@/types/cart';
import { ApiError, cartService } from '@/lib/services/cart';
import { useAuth } from '@/components/layout/AuthContext';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';

const GUEST_CART_KEY = 'guest_cart_v1';
const GUEST_CART_TTL = 1000 * 60 * 60 * 24 * 7;
const DEFAULT_IMAGE = '/images/home/product.png';

function parseCompositeCartItemId(id: string): { productId: string; variantId: string } | null {
  const idx = id.lastIndexOf('-');
  if (idx <= 0 || idx === id.length - 1) return null;
  return { productId: id.slice(0, idx), variantId: id.slice(idx + 1) };
}

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
  updateItem: (
    itemId: string,
    quantity: number,
  ) => Promise<{ ok: true } | { ok: false; errorCode: string; details?: unknown }>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromoCode: (code: string, email?: string) => Promise<void>;
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
  const tCart = useTranslations('user.cart');

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
            setItems(
              (guest.items || []).map((it) => {
                if (it.productId && it.variantId) return it;
                const parsed = parseCompositeCartItemId(it.id);
                return parsed ? { ...it, ...parsed } : it;
              }),
            );
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

          notify.success(tCart('toasts.added'));
        } else {
          // 📌 Guest cart: fetch product data from API
          const res = await fetch(`/api/products/${productId}`);
          if (!res.ok) {
            const msg = tCart('toasts.addFailed');
            setError(msg);
            notify.error(msg);
            return;
          }

          const product = await res.json();
          const variant = product.variants?.find((v: any) => v.id === variantId);
          if (!variant) {
            const msg = tCart('toasts.addFailed');
            setError(msg);
            notify.error(msg);
            return;
          }

          const availableFlag = (variant.isAvailable ?? product.isAvailable ?? true) !== false;
          const stockValue = variant.stock ?? product.stock;

          const existingItemIndex = items.findIndex(
            (item) => item.id === `${productId}-${variantId}`,
          );
          const desiredQuantity =
            existingItemIndex >= 0 ? (items[existingItemIndex].quantity || 0) + quantity : quantity;

          const hasEnoughStock = stockValue === undefined ? true : stockValue >= desiredQuantity;
          if (!availableFlag || !hasEnoughStock) {
            const msg =
              !availableFlag || (stockValue ?? 0) <= 0
                ? tCart('toasts.outOfStock')
                : tCart('toasts.insufficientStock');
            setError(msg);
            notify.error(msg);
            return;
          }

          const price = variant.price;
          const imageSrc = product.images?.[0]?.src || DEFAULT_IMAGE;

          if (existingItemIndex >= 0) {
            setItems((prev) =>
              prev.map((item, idx) =>
                idx === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            );
          } else {
            const newItem: CartItemUI = {
              id: `${productId}-${variantId}`,
              productId,
              variantId,
              slug: product.slug,
              title: product.title,
              imageSrc,
              price,
              volume: variant.volume,
              unit: variant.unit,
              quantity,
            };
            setItems((prev) => [...prev, newItem]);
          }

          notify.success(tCart('toasts.added'));
        }
      } catch (e: unknown) {
        let msg = tCart('toasts.addFailed');
        if (e instanceof ApiError) {
          if (e.errorCode === 'OUT_OF_STOCK') msg = tCart('toasts.outOfStock');
          if (e.errorCode === 'INSUFFICIENT_STOCK') msg = tCart('toasts.insufficientStock');
        }
        setError(msg);
        notify.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [user, items, tCart],
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
          return { ok: true } as const;
        } else {
          if (quantity <= 0) {
            setItems((prev) => prev.filter((i) => i.id !== itemId));
            return { ok: true } as const;
          }

          // Guest cart stock check - fetch from API
          const sep = itemId.lastIndexOf('-');
          const productId = sep > 0 ? itemId.slice(0, sep) : '';
          const variantId = sep > 0 ? itemId.slice(sep + 1) : '';

          const res = await fetch(`/api/products/${productId}`);
          if (!res.ok) {
            const msg = tCart('toasts.addFailed');
            notify.error(msg);
            return { ok: false, errorCode: 'UPDATE_FAILED' } as const;
          }

          const product = await res.json();
          const variant = product?.variants?.find((v: any) => v.id === variantId);
          if (!variant) {
            const msg = tCart('toasts.addFailed');
            notify.error(msg);
            return { ok: false, errorCode: 'UPDATE_FAILED' } as const;
          }

          const availableFlag = (variant.isAvailable ?? product.isAvailable ?? true) !== false;
          const stockValue = variant.stock ?? product.stock;
          const hasEnoughStock = stockValue === undefined ? true : stockValue >= quantity;

          if (!availableFlag || !hasEnoughStock) {
            const outOfStock = !availableFlag || (stockValue ?? 0) <= 0;
            const msg = outOfStock ? tCart('toasts.outOfStock') : tCart('toasts.insufficientStock');
            notify.error(msg);
            return {
              ok: false,
              errorCode: outOfStock ? 'OUT_OF_STOCK' : 'INSUFFICIENT_STOCK',
              details: { available: stockValue },
            } as const;
          }

          setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
          return { ok: true } as const;
        }
      } catch (e: unknown) {
        if (e instanceof ApiError) {
          if (e.errorCode === 'OUT_OF_STOCK') {
            notify.error(tCart('toasts.outOfStock'));
            return { ok: false, errorCode: 'OUT_OF_STOCK', details: e.details } as const;
          }
          if (e.errorCode === 'INSUFFICIENT_STOCK') {
            notify.error(tCart('toasts.insufficientStock'));
            return { ok: false, errorCode: 'INSUFFICIENT_STOCK', details: e.details } as const;
          }

          // Other API error: treat as non-fatal (toast), but keep a generic code for UI.
          notify.error(tCart('toasts.addFailed'));
          return {
            ok: false,
            errorCode: e.errorCode || 'UPDATE_FAILED',
            details: e.details,
          } as const;
        }

        setError('Failed to update item');
        return { ok: false, errorCode: 'UPDATE_FAILED' } as const;
      } finally {
        setIsLoading(false);
      }
    },
    [user, tCart],
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
        if (user) {
          // Authenticated carts live on the server; email is resolved server-side.
          const payload: ApplyPromoCodeRequest = { promoCode: code };
          const cart = await cartService.applyPromoCode(payload);
          setItems(cart.items.map(cartItemToUI));
          setPromoCode(cart.promoCode);
          setPromoDiscount(cart.promoDiscount);
          return;
        }

        // Guest cart lives client-side; validate promo against subtotal.
        if (!items.length) {
          throw new ApiError(
            'Cart is empty',
            400,
            'CART_EMPTY',
            'Il carrello è vuoto. Aggiungi prodotti prima di applicare il codice.',
          );
        }

        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

        const response = await fetch('/api/promocode/validate', {
          method: 'POST',
          headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify({ promoCode: code, subtotal }),
        });

        const result = await response.json().catch(() => ({
          success: false,
          errorCode: 'UNKNOWN',
          error: 'Unknown error',
        }));

        if (!response.ok || !result?.success) {
          throw new ApiError(
            String(result?.error || 'Failed to apply promo code'),
            response.status,
            String(result?.errorCode || 'UNKNOWN'),
            result,
          );
        }

        setPromoCode(String(result.promoCode));
        setPromoDiscount(Number(result.promoDiscount) || 0);
      } catch (err: any) {
        const codeFromApi = err?.errorCode;
        const next = codeFromApi ? String(codeFromApi) : err?.message || 'UNKNOWN';
        setError(`promo: ${next}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, items],
  );

  const removePromoCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        const cart = await cartService.removePromoCode();
        setItems(cart.items.map(cartItemToUI));
        setPromoCode(cart.promoCode);
        setPromoDiscount(cart.promoDiscount);
      } else {
        setPromoCode(undefined);
        setPromoDiscount(undefined);
      }
    } catch (err: any) {
      const codeFromApi = err?.errorCode;
      const next = codeFromApi ? String(codeFromApi) : err?.message || 'UNKNOWN';
      setError(`promo: ${next}`);
      throw err;
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
