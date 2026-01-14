import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { applyInventoryToMockProducts } from '@/lib/utils/inventory';

export const GET = handleApi(async () => {
  await connectToDB();
  const products = await applyInventoryToMockProducts();
  return NextResponse.json(products);
});
