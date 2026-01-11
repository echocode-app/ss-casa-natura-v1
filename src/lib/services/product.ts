import { Product, ProductVariant } from '@/config/products/product.types';

export interface ProductLookupResult {
  id: string;
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

const USE_MOCK_PRODUCTS = process.env.USE_MOCK_PRODUCTS !== 'false';

async function fetchFromApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null as T;
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
}

export const productService: ProductService = {
  async getProduct(productId: string): Promise<Product | null> {
    if (USE_MOCK_PRODUCTS) {
      const { PRODUCTS_MOCK } = await import('@/config/products/products.mock');
      return PRODUCTS_MOCK.find((p) => p.id === productId) || null;
    }
    return fetchFromApi<Product>(`/api/products/${productId}`);
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

    const basePrice = product.price;
    const priceModifier = variant.priceModifier ?? 0;
    const finalPrice = basePrice + priceModifier;

    return {
      id: product.id,
      title: product.title,
      imageSrc: product.images?.[0]?.src,
      price: finalPrice,
      variant,
    };
  },
};
