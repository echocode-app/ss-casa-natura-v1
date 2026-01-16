import SiteSettings from '@/lib/db/models/SiteSettings';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function computeGlobalPromotionDiscount(params: {
  items: Array<{ productId: string; totalPrice: number }>;
  subtotal: number;
}): Promise<number> {
  const settings = await SiteSettings.findOne({ key: 'default' }).lean();
  const promo = settings?.globalPromotion;

  if (!promo?.enabled) return 0;

  const percent = Math.max(0, Math.min(100, Number(promo.percent || 0)));
  if (!percent) return 0;

  const ids = new Set(Array.isArray(promo.productIds) ? promo.productIds.map(String) : []);

  const eligibleSubtotal = params.items.reduce((sum, item) => {
    if (promo.scope === 'selected') {
      if (!ids.has(String(item.productId))) return sum;
    }
    return sum + Math.max(0, Number(item.totalPrice || 0));
  }, 0);

  const subtotal = Math.max(0, Number(params.subtotal || 0));
  const discount = round2((eligibleSubtotal * percent) / 100);

  return Math.max(0, Math.min(discount, subtotal));
}
