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
      logError('[api/products/:slug/upsell] db unavailable, falling back to mock products', err);
      products = PRODUCTS_MOCK;
    }
    const product = products.find((p) => p.slug === slug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Mock upsell: return products from same line or random
    const upsellProducts = products
      .filter((p) => p.lineId === product.lineId && p.id !== product.id)
      .slice(0, 3);

    return NextResponse.json(upsellProducts);
  },
);
