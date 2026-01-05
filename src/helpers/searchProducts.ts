import { Product, ProductCategory, ProductLine } from '@/config/products/product.types';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';
import { PRODUCT_LINES } from '@/config/products/product.lines';

export interface SearchSources {
  products?: Product[];
  categories?: ProductCategory[];
  lines?: ProductLine[];
}

export interface SearchResult {
  product: Product;
  matchedBy: 'title' | 'category' | 'line';
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/**
 * Search products by title, category title, or line title.
 */
export function searchProducts(query: string, sources: SearchSources = {}): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];

  const products = sources.products || PRODUCTS_MOCK;
  const categories = sources.categories || PRODUCT_CATEGORIES;
  const lines = sources.lines || PRODUCT_LINES;

  const categoryMap = new Map(categories.map((c) => [c.id, normalize(c.title)]));
  const lineMap = new Map(lines.map((l) => [l.id, normalize(l.title)]));

  const results: SearchResult[] = [];

  for (const product of products) {
    const titleMatch = normalize(product.title).includes(q);
    const categoryMatch = product.categoryIds.some((id) => categoryMap.get(id)?.includes(q));
    const lineMatch = product.lineId ? lineMap.get(product.lineId)?.includes(q) : false;

    if (titleMatch) {
      results.push({ product, matchedBy: 'title' });
      continue;
    }
    if (categoryMatch) {
      results.push({ product, matchedBy: 'category' });
      continue;
    }
    if (lineMatch) {
      results.push({ product, matchedBy: 'line' });
    }
  }

  return results;
}
