import { NextResponse } from 'next/server';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async (_req: Request, { params }: { params: { slug: string } }) => {
  const { slug } = params;
  const product = PRODUCTS_MOCK.find((p) => p.slug === slug);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Mock upsell: return products from same line or random
  const upsellProducts = PRODUCTS_MOCK.filter(
    (p) => p.lineId === product.lineId && p.id !== product.id,
  ).slice(0, 3);

  return NextResponse.json(upsellProducts);
});
