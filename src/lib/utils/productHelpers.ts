/**
 * Product Helper Utilities
 * Auto-generate SKU and find related products
 */

import type { Product } from '@/config/products/product.types';

/**
 * Generate next SKU in format: 0001, 0002, ..., 0100, 0101, etc.
 * @param lastSku - The last SKU in database (e.g., "0099")
 * @returns Next SKU (e.g., "0100")
 */
export function generateNextSku(lastSku?: string): string {
  if (!lastSku) {
    return '0001';
  }

  const lastNumber = parseInt(lastSku, 10);
  if (isNaN(lastNumber)) {
    return '0001';
  }

  const nextNumber = lastNumber + 1;
  return nextNumber.toString().padStart(4, '0');
}

/**
 * Find related products based on:
 * 1. Same category
 * 2. Same subcategory (if exists)
 * 3. Same line (if exists)
 *
 * Priority: Same line + same category > Same category > Same line
 *
 * @param product - The product to find related items for
 * @param allProducts - All available products
 * @param limit - Maximum number of related products to return (default: 4)
 * @returns Array of related products
 */
export function getRelatedProducts(
  product: Product,
  allProducts: Product[],
  limit: number = 4,
): Product[] {
  // Exclude the current product and unavailable products
  const candidates = allProducts.filter((p) => p.id !== product.id && p.isAvailable !== false);

  if (candidates.length === 0) {
    return [];
  }

  // Score products based on similarity
  const scored = candidates.map((candidate) => {
    let score = 0;

    // Same line + same category (highest priority)
    if (product.lineId && candidate.lineId === product.lineId) {
      score += 10;
    }

    // Has at least one common category
    const commonCategories = candidate.categoryIds.filter((catId) =>
      product.categoryIds.includes(catId),
    );
    score += commonCategories.length * 5;

    return { product: candidate, score };
  });

  // Sort by score (descending) and return top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
}

/**
 * Get product categories display names
 * Useful for showing breadcrumbs or related product hints
 *
 * Categories:
 * - Bucato
 * - Detersivi piatti
 * - Cura Lavastoviglie
 * - Cucina
 * - Detersivi Bucato
 * - Ammorbidenti
 * - Pulizia
 * - Sgrassatori
 * - Lavapavimenti
 *
 * Lines:
 * - Lavanda
 * - Brezza Marina
 * - Agrumi di Sicilia
 * - Fiore di Loto
 * - Marsiglia
 * - Neutro
 */
export const PRODUCT_CATEGORIES = [
  'Bucato',
  'Detersivi piatti',
  'Cura Lavastoviglie',
  'Cucina',
  'Detersivi Bucato',
  'Ammorbidenti',
  'Pulizia',
  'Sgrassatori',
  'Lavapavimenti',
] as const;

export const PRODUCT_LINES = [
  'Lavanda',
  'Brezza Marina',
  'Agrumi di Sicilia',
  'Fiore di Loto',
  'Marsiglia',
  'Neutro',
] as const;
