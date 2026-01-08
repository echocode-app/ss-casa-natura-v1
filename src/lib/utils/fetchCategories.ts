import { ProductCategory } from '@/config/products/product.types';

export async function fetchCategories(useMock: boolean = false): Promise<ProductCategory[]> {
  if (useMock) {
    const { PRODUCT_CATEGORIES } = await import('@/config/products/product.categories');
    return PRODUCT_CATEGORIES;
  }

  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
