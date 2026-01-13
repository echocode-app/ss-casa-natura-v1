import { Product } from '@/config/products/product.types';

export function sortProducts(products: Product[]): Product[] {
  if (!products || products.length === 0) return [];

  return [...products].sort((a, b) => {
    const aIsBestSeller = a.isBestSeller ? 1 : 0;
    const bIsBestSeller = b.isBestSeller ? 1 : 0;
    if (aIsBestSeller !== bIsBestSeller) {
      return bIsBestSeller - aIsBestSeller;
    }

    const aIsAvailable = a.isAvailable ?? (a.stock !== undefined ? a.stock > 0 : true);
    const bIsAvailable = b.isAvailable ?? (b.stock !== undefined ? b.stock > 0 : true);

    if (aIsAvailable !== bIsAvailable) {
      return bIsAvailable ? 1 : -1;
    }

    const aPrice = a.variants?.[0]?.priceModifier ?? a.price ?? 0;
    const bPrice = b.variants?.[0]?.priceModifier ?? b.price ?? 0;

    if (a.isBestSeller || b.isBestSeller) {
      return bPrice - aPrice;
    }

    return aPrice - bPrice;
  });
}

export function isProductAvailable(product: Product, variantId?: string): boolean {
  if (product.isAvailable === false) return false;

  if (variantId && product.variants) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) {
      if (variant.isAvailable === false) return false;
      if (variant.stock !== undefined && variant.stock <= 0) return false;
    }
  }

  if (product.stock !== undefined && product.stock <= 0) return false;

  return true;
}

export function getStockStatusMessage(
  product: Product,
  variantId?: string,
): 'available' | 'low-stock' | 'out-of-stock' {
  if (!isProductAvailable(product, variantId)) {
    return 'out-of-stock';
  }

  let stock = product.stock;
  if (variantId && product.variants) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant?.stock !== undefined) {
      stock = variant.stock;
    }
  }

  if (stock !== undefined && stock > 0 && stock <= 5) {
    return 'low-stock';
  }

  return 'available';
}
