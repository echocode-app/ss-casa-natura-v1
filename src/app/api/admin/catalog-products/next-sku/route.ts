import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdminSection } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import { applyInventoryToCatalogProducts } from '@/lib/utils/inventory';
import { generateNextSku } from '@/lib/utils/productHelpers';

/**
 * GET /api/admin/catalog-products/next-sku
 * Returns the next available SKU in format 0001, 0002, etc.
 */
export const GET = handleApi(async () => {
  const authError = await requireAdminSection('products');
  if (authError) return authError;

  await connectToDB();

  // Get all products and find the highest SKU
  const products = await applyInventoryToCatalogProducts({ includeArchived: true });

  // Extract numeric SKUs and find max
  const skus = products
    .map((p: any) => p.sku)
    .filter(Boolean)
    .map((sku: string) => {
      // Try to parse 4-digit number from SKU
      const match = sku.match(/(\d{4})/);
      return match ? parseInt(match[1], 10) : 0;
    });

  const maxSku = skus.length > 0 ? Math.max(...skus) : 0;
  const lastSku = maxSku.toString().padStart(4, '0');

  const nextSku = generateNextSku(lastSku);

  return NextResponse.json({
    success: true,
    sku: nextSku,
    lastSku,
  });
});
