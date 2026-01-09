'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { CartItemUI, cartItemToUI } from '@/types/cart';
import { cartService } from '@/lib/services/cart';

interface CartContextType {
  items: CartItemUI[];
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  addItem: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromoCode: (promoCode: string) => Promise<void>;
  removePromoCode: () => Promise<void>;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  promoCode?: string;
  promoDiscount?: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  isLoading: false,
  isInitializing: true,
  error: null,
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  applyPromoCode: async () => {},
  removePromoCode: async () => {},
  getItemCount: () => 0,
  getSubtotal: () => 0,
  getTotal: () => 0,
});

const CART_STORAGE_KEY = 'casa_natura_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemUI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>();
  const [promoDiscount, setPromoDiscount] = useState<number>();
  const initialized = useRef(false);

  useEffect(() => {
    const initCart = async () => {
      if (initialized.current) return;
      initialized.current = true;

      try {
        const cart = await cartService.getCart();
        setItems(cart.items.map(cartItemToUI));
        setPromoCode(cart.promoCode);
        setPromoDiscount(cart.promoDiscount);

        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify({
            items: cart.items.map(cartItemToUI),
            promoCode: cart.promoCode,
            promoDiscount: cart.promoDiscount,
            timestamp: Date.now(),
          }),
        );
      } catch {
        try {
          const stored = localStorage.getItem(CART_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setItems(parsed.items || []);
            setPromoCode(parsed.promoCode);
            setPromoDiscount(parsed.promoDiscount);
          }
        } catch {}
        setError('Failed to load cart');
      } finally {
        setIsInitializing(false);
      }
    };

    initCart();
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      try {
        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify({ items, promoCode, promoDiscount, timestamp: Date.now() }),
        );
      } catch {}
    }
  }, [items, promoCode, promoDiscount, isInitializing]);

  const addItem = useCallback(
    async (productId: string, variantId: string, quantity: number = 1) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticItem: CartItemUI = { id: tempId, title: 'Loading...', price: 0, quantity };
      setItems((prev) => [...prev, optimisticItem]);
      setError(null);

      try {
        const cart = await cartService.addItem({ productId, variantId, quantity });
        setItems(cart.items.map(cartItemToUI));
      } catch (err) {
        setItems((prev) => prev.filter((item) => item.id !== tempId));
        setError(err instanceof Error ? err.message : 'Failed to add item');
        throw err;
      }
    },
    [],
  );

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
    setError(null);

    try {
      const cart = await cartService.updateItem({ itemId, quantity });
      setItems(cart.items.map(cartItemToUI));
    } catch (err) {
      try {
        const cart = await cartService.getCart();
        setItems(cart.items.map(cartItemToUI));
      } catch {}
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  }, []);

  const removeItem = useCallback(
    async (itemId: string) => {
      const previousItems = [...items];
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setError(null);

      try {
        await cartService.removeItem({ itemId });
      } catch (err) {
        setItems(previousItems);
        setError(err instanceof Error ? err.message : 'Failed to remove item');
        throw err;
      }
    },
    [items],
  );

  const clearCart = useCallback(async () => {
    setItems([]);
    setError(null);

    try {
      await cartService.clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      throw err;
    }
  }, []);

  const getItemCount = useCallback(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const getSubtotal = useCallback(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const getTotal = useCallback(
    () => getSubtotal() - (promoDiscount || 0),
    [getSubtotal, promoDiscount],
  );

  const applyPromoCode = useCallback(async (code: string) => {
    setError(null);
    try {
      const cart = await cartService.applyPromoCode({ promoCode: code });
      setItems(cart.items.map(cartItemToUI));
      setPromoCode(cart.promoCode);
      setPromoDiscount(cart.promoDiscount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply promo code');
      throw err;
    }
  }, []);

  const removePromoCode = useCallback(async () => {
    setError(null);
    try {
      const cart = await cartService.removePromoCode();
      setItems(cart.items.map(cartItemToUI));
      setPromoCode(cart.promoCode);
      setPromoDiscount(cart.promoDiscount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove promo code');
      throw err;
    }
  }, []);

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
