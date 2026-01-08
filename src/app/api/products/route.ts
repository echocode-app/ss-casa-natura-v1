import { NextResponse } from 'next/server';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async () => {
  // For now, return mock data. Later integrate with DB.
  return NextResponse.json(PRODUCTS_MOCK);
});
