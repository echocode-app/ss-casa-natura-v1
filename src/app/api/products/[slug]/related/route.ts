import { NextResponse } from 'next/server';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async (_req: Request, { params }: { params: { slug: string } }) => {
  const { slug } = params;
  const product = PRODUCTS_MOCK.find((p) => p.slug === slug);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const categoryId = product.categoryIds[0];
  const relatedProducts = PRODUCTS_MOCK.filter(
    (p) => p.categoryIds.includes(categoryId) && p.id !== product.id,
  );

  return NextResponse.json(relatedProducts);
});
