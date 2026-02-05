import { checkItemsInStock } from '@/lib/utils/inventory';
import { computeGlobalPromotionDiscount } from '@/lib/utils/globalPromotion';
import { computePromoDiscount } from '@/lib/utils/promo';
import { CartItemDB } from '@/types/cart';

type CartLike = {
  items: CartItemDB[];
  subtotal: number;
  discount?: number;
  promoCode?: string;
  promoEmail?: string;
  promoDiscount?: number;
  total: number;
};

export async function removeUnavailableCartItems(cart: CartLike) {
  const items = cart.items || [];
  if (!items.length) {
    return { removed: [] as CartItemDB[] };
  }

  const stockCheck = await checkItemsInStock(
    items.map((i) => ({
      productId: String(i.productId),
      variantId: String(i.variantId),
      quantity: Math.max(1, Math.floor(i.quantity || 1)),
    })),
  );

  if (stockCheck.ok) {
    return { removed: [] as CartItemDB[] };
  }

  const removedKeys = new Set(
    stockCheck.issues
      .filter((issue) => issue.reason === 'NOT_AVAILABLE')
      .map((issue) => `${issue.productId}::${issue.variantId}`),
  );

  if (!removedKeys.size) {
    return { removed: [] as CartItemDB[] };
  }

  const removed: CartItemDB[] = [];
  const kept: CartItemDB[] = [];

  for (const item of items) {
    const key = `${item.productId}::${item.variantId}`;
    if (removedKeys.has(key)) {
      removed.push(item);
    } else {
      kept.push(item);
    }
  }

  cart.items = kept;
  return { removed };
}

export async function recomputeCartTotals(cart: CartLike) {
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

  cart.discount = await computeGlobalPromotionDiscount({
    items: cart.items.map((i) => ({
      productId: String(i.productId),
      totalPrice: i.totalPrice,
    })),
    subtotal: cart.subtotal,
  });

  if (cart.promoCode) {
    const promoResult = await computePromoDiscount({
      promoCode: cart.promoCode,
      subtotal: cart.subtotal,
      email: cart.promoEmail,
    });

    if (promoResult.ok) {
      cart.promoCode = promoResult.promoCode;
      cart.promoDiscount = promoResult.promoDiscount;
    } else {
      cart.promoCode = undefined;
      cart.promoEmail = undefined;
      cart.promoDiscount = 0;
    }
  }

  cart.total = cart.subtotal - (cart.discount || 0) - (cart.promoDiscount || 0);
}
