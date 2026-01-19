import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { applyInventoryToMockProducts } from '@/lib/utils/inventory';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { logError } from '@/lib/utils/logger';

export const GET = handleApi(async () => {
  try {
    await connectToDB();
    const products = await applyInventoryToMockProducts();
    return NextResponse.json(products);
  } catch (err) {
    logError('[api/products] db unavailable, falling back to mock products', err);
    return NextResponse.json(PRODUCTS_MOCK, {
      status: 200,
      headers: { 'x-products-source': 'mock-fallback' },
    });
  }
});
