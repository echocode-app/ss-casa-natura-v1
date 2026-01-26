import { Product } from '@/config/products/product.types';

function getServerBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return 'http://localhost:3000';
}

function buildApiUrl(path: string): string {
  if (typeof window !== 'undefined') return path;
  return `${getServerBaseUrl()}${path}`;
}

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
): Promise<PaginatedResponse<Product>> {
  const { page = 1, limit = 12, categoryIds = [], sortBy, sortOrder } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(categoryIds.length && { categories: categoryIds.join(',') }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  });

  const res = await fetch(buildApiUrl(`/api/products?${params}`), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(buildApiUrl('/api/products'), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const res = await fetch(buildApiUrl(`/api/products/${slug}`), { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}
