import { Product } from '@/config/products/product.types';

export function sortProducts(products: Product[]): Product[] {
  if (!products || products.length === 0) return [];

  const isVariantAvailableForPurchase = (variant: NonNullable<Product['variants']>[number]) => {
    if (variant?.isAvailable === false) return false;
    const stock = variant?.stock;
    if (stock !== undefined && stock <= 0) return false;
    return true;
  };

  const isAvailableForSort = (product: Product): boolean => {
    if (product.variants?.length) {
      return product.variants.some((v) => isVariantAvailableForPurchase(v));
    }
    return true;
  };

  return [...products].sort((a, b) => {
    const aIsAvailable = isAvailableForSort(a);
    const bIsAvailable = isAvailableForSort(b);
    if (aIsAvailable !== bIsAvailable) return aIsAvailable ? -1 : 1;

    // Check if any variant is a bestseller
    const aIsBestSeller = a.variants?.some((v) => v.isBestSeller) ? 1 : 0;
    const bIsBestSeller = b.variants?.some((v) => v.isBestSeller) ? 1 : 0;
    if (aIsBestSeller !== bIsBestSeller) return bIsBestSeller - aIsBestSeller;

    // Use price from first available variant
    const aPrice = a.variants?.[0]?.price ?? 0;
    const bPrice = b.variants?.[0]?.price ?? 0;

    if (aIsBestSeller || bIsBestSeller) {
      return bPrice - aPrice;
    }

    return aPrice - bPrice;
  });
}

export function isProductAvailable(product: Product, variantId?: string): boolean {
  if (product.variants?.length) {
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) return false;
      if (variant.isAvailable === false) return false;

      const stock = variant.stock;
      if (stock !== undefined && stock <= 0) return false;

      return true;
    }

    return product.variants.some((v) => {
      if (v.isAvailable === false) return false;
      const stock = v.stock;
      if (stock !== undefined && stock <= 0) return false;
      return true;
    });
  }

  return true;
}

export function getFirstPurchasableVariant(
  product: Product,
): NonNullable<Product['variants']>[number] | null {
  if (!product?.variants?.length) return null;
  return product.variants.find((v) => isProductAvailable(product, v.id)) ?? null;
}

export function getStockStatusMessage(
  product: Product,
  variantId?: string,
): 'available' | 'low-stock' | 'out-of-stock' {
  if (!isProductAvailable(product, variantId)) {
    return 'out-of-stock';
  }

  let stock: number | undefined;
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
