import { productService } from '@/lib/services/product';
import { CheckoutItemInput } from '@/types/checkout';

export type PricedLineItem = {
  productId: string;
  variantId: string;
  slug: string;
  title: string;
  imageSrc?: string;
  price: number;
  quantity: number;
  volume?: number;
  unit?: string;
  lineTotal: number;
  weightKg: number;
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeWeightKg(product: any): number {
  if (typeof product?.weightGrams === 'number') return product.weightGrams / 1000;
  if (typeof product?.weight === 'number') {
    // Heuristic: if weight is large, treat it as grams; otherwise assume kg.
    return product.weight > 50 ? product.weight / 1000 : product.weight;
  }
  return 0;
}

export async function priceItems(items: CheckoutItemInput[]): Promise<{
  pricedItems: PricedLineItem[];
  subtotal: number;
  totalWeightKg: number;
}> {
  const pricedItems: PricedLineItem[] = [];

  for (const item of items) {
    const quantity = Math.max(1, Math.floor(item.quantity || 1));

    const product = await productService.getProduct(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const lookup = await productService.getProductForCart(item.productId, item.variantId);
    const lineTotal = roundMoney(lookup.price * quantity);

    pricedItems.push({
      productId: item.productId,
      variantId: item.variantId,
      slug: lookup.slug,
      title: lookup.title,
      imageSrc: lookup.imageSrc,
      price: lookup.price,
      quantity,
      volume: lookup.variant?.volume,
      unit: lookup.variant?.unit,
      lineTotal,
      weightKg: normalizeWeightKg(product) * quantity,
    });
  }

  const subtotal = roundMoney(pricedItems.reduce((sum, i) => sum + i.lineTotal, 0));
  const totalWeightKg = roundMoney(pricedItems.reduce((sum, i) => sum + i.weightKg, 0));

  return { pricedItems, subtotal, totalWeightKg };
}
