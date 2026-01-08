import { NextResponse } from 'next/server';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async () => {
  return NextResponse.json(PRODUCT_CATEGORIES);
});
