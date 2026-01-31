export type GuestCartItemPayload = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type GuestCartPayload = {
  items: GuestCartItemPayload[];
};

const GUEST_CART_KEY = 'guest_cart_v1';

function parseCompositeCartItemId(id: string): { productId: string; variantId: string } | null {
  const idx = id.lastIndexOf('-');
  if (idx <= 0 || idx === id.length - 1) return null;
  return { productId: id.slice(0, idx), variantId: id.slice(idx + 1) };
}

export function getGuestCartPayload(): GuestCartPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(GUEST_CART_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const rawItems = Array.isArray(parsed?.items) ? parsed.items : [];
    const items = rawItems
      .map((item: any) => {
        const productId = item?.productId || parseCompositeCartItemId(item?.id || '')?.productId;
        const variantId = item?.variantId || parseCompositeCartItemId(item?.id || '')?.variantId;
        const quantity = Number(item?.quantity);
        if (!productId || !variantId) return null;
        if (!Number.isFinite(quantity) || quantity <= 0) return null;
        return { productId: String(productId), variantId: String(variantId), quantity };
      })
      .filter(Boolean) as GuestCartItemPayload[];

    if (!items.length) return null;
    return { items };
  } catch {
    return null;
  }
}
