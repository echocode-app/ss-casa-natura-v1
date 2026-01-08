import { Product } from '@/config/products/product.types';

export async function fetchProducts(useMock: boolean = false): Promise<Product[]> {
  if (useMock) {
    const { PRODUCTS_MOCK } = await import('@/config/products/products.mock');
    return PRODUCTS_MOCK;
  }

  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(
  slug: string,
  useMock: boolean = false,
): Promise<Product | null> {
  if (useMock) {
    const { PRODUCTS_MOCK } = await import('@/config/products/products.mock');
    return PRODUCTS_MOCK.find((p) => p.slug === slug) || null;
  }

  const res = await fetch(`/api/products/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}
