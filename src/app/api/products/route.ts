import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { applyInventoryToCatalogProducts } from '@/lib/utils/inventory';
import { logError } from '@/lib/utils/logger';

export const GET = handleApi(async () => {
  try {
    await connectToDB();
    const products = await applyInventoryToCatalogProducts();

    // Log for debugging on production
    console.log(`[api/products] Successfully fetched ${products.length} products`);

    return NextResponse.json(products);
  } catch (err) {
    // Enhanced error logging
    console.error('[api/products] Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      error: err,
    });

    logError('[api/products] Failed to fetch products from database', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
});
