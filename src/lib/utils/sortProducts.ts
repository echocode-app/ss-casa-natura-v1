import { Product } from '@/config/products/product.types';

export function sortProducts(products: Product[]): Product[] {
  if (!products || products.length === 0) return [];

  const getVariantCandidates = (product: Product) => {
    const variants = product.variants || [];
    const purchasable = variants.filter((variant) => {
      if (variant?.isAvailable === false) return false;
      const stock = variant?.stock;
      if (stock !== undefined && stock <= 0) return false;
      return true;
    });
    return purchasable.length ? purchasable : variants;
  };

  const getMaxPrice = (product: Product): number => {
    const candidates = getVariantCandidates(product);
    if (!candidates.length) return 0;
    return candidates.reduce((max, v) => Math.max(max, Number(v.price || 0)), 0);
  };

  const getMaxStock = (product: Product): number => {
    const candidates = getVariantCandidates(product);
    if (!candidates.length) return 0;
    return candidates.reduce((max, v) => Math.max(max, Number(v.stock || 0)), 0);
  };

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

    const aIsBestSeller = a.variants?.some((v) => v.isBestSeller) ? 1 : 0;
    const bIsBestSeller = b.variants?.some((v) => v.isBestSeller) ? 1 : 0;
    if (aIsBestSeller !== bIsBestSeller) return bIsBestSeller - aIsBestSeller;

    const aPrice = getMaxPrice(a);
    const bPrice = getMaxPrice(b);
    if (aPrice !== bPrice) return bPrice - aPrice;

    const aStock = getMaxStock(a);
    const bStock = getMaxStock(b);
    if (aStock !== bStock) return bStock - aStock;

    return String(a.title || '').localeCompare(String(b.title || ''));
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
  const available = product.variants.filter((v) => isProductAvailable(product, v.id));
  if (!available.length) return null;
  const bestSeller = available.find((v) => v.isBestSeller);
  return bestSeller || available[0] || null;
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
