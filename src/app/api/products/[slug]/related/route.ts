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

      const product = products.find((p) => p.slug === slug);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const categoryId = product.categoryIds[0];
      const relatedProducts = products.filter(
        (p) => p.categoryIds.includes(categoryId) && p.id !== product.id,
      );

      return NextResponse.json(relatedProducts);
    } catch (err) {
      logError('[api/products/:slug/related] Failed to fetch related products', err);
      return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 });
    }
  },
);
