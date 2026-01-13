import { Product } from '@/config/products/product.types';

interface FetchProductsOptions {
  page?: number;
  limit?: number;
  categoryIds?: string[];
  sortBy?: 'price' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function fetchProductsPaginated(
  options: FetchProductsOptions = {},
  useMock: boolean = false,
): Promise<PaginatedResponse<Product>> {
  const { page = 1, limit = 12, categoryIds = [], sortBy, sortOrder } = options;

  if (useMock) {
    const { PRODUCTS_MOCK } = await import('@/config/products/products.mock');
    let filtered = PRODUCTS_MOCK;

    if (categoryIds.length > 0) {
      filtered = PRODUCTS_MOCK.filter((p) =>
        p.categoryIds?.some((catId) => categoryIds.includes(catId)),
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasMore: endIndex < filtered.length,
      },
    };
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(categoryIds.length && { categories: categoryIds.join(',') }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  });

  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

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
