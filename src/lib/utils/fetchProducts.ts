import { Product } from '@/config/products/product.types';

async function getServerBaseUrl(): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL_URL);
  if (siteUrl && isProd) return siteUrl.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  if (process.env.NODE_ENV === 'production') {
    try {
      const { headers } = await import('next/headers');
      const h = await headers();
      const host = h.get('x-forwarded-host') || h.get('host');
      const proto = h.get('x-forwarded-proto') || 'https';
      if (host) return `${proto}://${host}`;
    } catch {
      // ignore
    }
  }

  return 'http://localhost:3000';
}

async function buildApiUrl(path: string): Promise<string> {
  if (typeof window !== 'undefined') return path;
  const base = await getServerBaseUrl();
  return `${base}${path}`;
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

  const res = await fetch(await buildApiUrl(`/api/products?${params}`), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(await buildApiUrl('/api/products'), { cache: 'no-store' });
    if (!res.ok) {
      await res.json().catch(() => ({}));
      throw new Error('Failed to fetch products');
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch {
    return [];
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(await buildApiUrl(`/api/products/${slug}`), { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) {
      await res.json().catch(() => ({}));
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}
