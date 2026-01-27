import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { applyInventoryToCatalogProducts } from '@/lib/utils/inventory';
import { logError } from '@/lib/utils/logger';

export const GET = handleApi(async () => {
  try {
    await connectToDB();
    const products = await applyInventoryToCatalogProducts();

    return NextResponse.json(products);
  } catch (err) {
    logError('[api/products] Failed to fetch products from database', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
});
