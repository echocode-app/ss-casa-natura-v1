import { Product, ProductCategory, ProductLine } from '@/config/products/product.types';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';
import { PRODUCT_LINES } from '@/config/products/product.lines';

export interface SearchSources {
  products: Product[]; // Required now
  categories?: ProductCategory[];
  lines?: ProductLine[];
}

export interface SearchResult {
  product: Product;
  matchedBy: 'title' | 'sku' | 'category' | 'line';
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const normalizeSku = (value: string) => normalize(value).replace(/[^a-z0-9]/g, '');

/**
 * Search products by title, category title, or line title.
 * Products array is required.
 */
export function searchProducts(query: string, sources: SearchSources): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];

  const qSku = normalizeSku(query);
  const qDigits = q.replace(/\D/g, '');
  const queryLooksLikeSku = qSku.startsWith('art') || qDigits.length >= 3;

  const products = sources.products;
  const categories = sources.categories || PRODUCT_CATEGORIES;
  const lines = sources.lines || PRODUCT_LINES;

  const categoryMap = new Map(categories.map((c) => [c.id, normalize(c.title)]));
  const lineMap = new Map(lines.map((l) => [l.id, normalize(l.title)]));

  const results: SearchResult[] = [];

  for (const product of products) {
    const titleMatch = normalize(product.title).includes(q);
    const skuNormalized = normalizeSku(product.sku ?? '');
    const skuMatch =
      (!!qSku && skuNormalized.includes(qSku)) ||
      (qDigits.length >= 3 && skuNormalized.replace(/\D/g, '').includes(qDigits));
    const categoryMatch = product.categoryIds.some((id) => categoryMap.get(id)?.includes(q));
    const lineMatch = product.lineId ? lineMap.get(product.lineId)?.includes(q) : false;

    if (titleMatch || skuMatch) {
      results.push({ product, matchedBy: queryLooksLikeSku && skuMatch ? 'sku' : 'title' });
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
