import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { applyInventoryToCatalogProducts } from '@/lib/utils/inventory';
import { logError } from '@/lib/utils/logger';

export const GET = handleApi(
  async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    try {
      await connectToDB();
      const products = await applyInventoryToCatalogProducts();

      // Find product by slug or id
      const product = products.find((p) => p.slug === slug || p.id === slug);

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(product);
    } catch (err) {
      logError('[api/products/:slug] Failed to fetch product', err);
      return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
  },
);
