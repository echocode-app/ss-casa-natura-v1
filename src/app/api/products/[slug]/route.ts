import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { applyInventoryToMockProducts } from '@/lib/utils/inventory';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { logError } from '@/lib/utils/logger';

export const GET = handleApi(
  async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    let products;
    try {
      await connectToDB();
      products = await applyInventoryToMockProducts();
    } catch (err) {
      logError('[api/products/:slug] db unavailable, falling back to mock products', err);
      products = PRODUCTS_MOCK;
    }
    const product = products.find((p) => p.slug === slug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  },
);
