import { Product, ProductVariant } from '@/config/products/product.types';

export interface ProductLookupResult {
  id: string;
  slug: string;
  title: string;
  imageSrc?: string;
  price: number;
  variant: ProductVariant;
}

export interface ProductService {
  getProduct(productId: string): Promise<Product | null>;
  getProductForCart(
    productId: string,
    variantId: string,
    quantity?: number,
  ): Promise<ProductLookupResult>;
}

export const productService: ProductService = {
  async getProduct(productId: string): Promise<Product | null> {
    // Server-side: use inventory utils directly
    if (typeof window === 'undefined') {
      const { applyInventoryToCatalogProducts } = await import('@/lib/utils/inventory');
      const products = await applyInventoryToCatalogProducts({ includeArchived: false });
      return products.find((p) => p.id === productId || p.slug === productId) || null;
    }

    // Client-side: fetch from API
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/products/${productId}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch product: ${res.status}`);
      }
      const data = await res.json();
      return data.success ? data.product : null;
    } catch {
      return null;
    }
  },

  async getProductForCart(productId: string, variantId: string): Promise<ProductLookupResult> {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const variant = product.variants?.find((v) => v.id === variantId);
    if (!variant) {
      throw new Error(`Variant not found: ${variantId}`);
    }

    const finalPrice = variant.price;

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      imageSrc: product.images?.[0]?.src,
      price: finalPrice,
      variant,
    };
  },
};
