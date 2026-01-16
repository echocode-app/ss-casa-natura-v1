import { Product } from '@/config/products/product.types';

export function sortProducts(products: Product[]): Product[] {
  if (!products || products.length === 0) return [];

  const isVariantAvailableForPurchase = (
    product: Product,
    variant: Product['variants'][number],
  ) => {
    if (product.isAvailable === false) return false;
    if (variant?.isAvailable === false) return false;

    const stock = variant?.stock ?? product.stock;
    if (stock !== undefined && stock <= 0) return false;

    return true;
  };

  const isAvailableForSort = (product: Product): boolean => {
    if (product.isAvailable === false) return false;

    if (product.variants?.length) {
      return product.variants.some((v) => isVariantAvailableForPurchase(product, v));
    }

    if (product.stock !== undefined) {
      return product.stock > 0;
    }

    return true;
  };

  return [...products].sort((a, b) => {
    const aIsAvailable = isAvailableForSort(a);
    const bIsAvailable = isAvailableForSort(b);
    if (aIsAvailable !== bIsAvailable) return aIsAvailable ? -1 : 1;

    const aIsBestSeller = a.isBestSeller ? 1 : 0;
    const bIsBestSeller = b.isBestSeller ? 1 : 0;
    if (aIsBestSeller !== bIsBestSeller) return bIsBestSeller - aIsBestSeller;

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

  if (product.variants?.length) {
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) return false;
      if (variant.isAvailable === false) return false;

      const stock = variant.stock ?? product.stock;
      if (stock !== undefined && stock <= 0) return false;

      return true;
    }

    return product.variants.some((v) => {
      if (v.isAvailable === false) return false;
      const stock = v.stock ?? product.stock;
      if (stock !== undefined && stock <= 0) return false;
      return true;
    });
  }

  if (product.stock !== undefined && product.stock <= 0) return false;

  return true;
}

export function getFirstPurchasableVariant(product: Product): Product['variants'][number] | null {
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
