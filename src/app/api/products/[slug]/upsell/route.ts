import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { applyInventoryToMockProducts } from '@/lib/utils/inventory';

export const GET = handleApi(
  async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    await connectToDB();
    const products = await applyInventoryToMockProducts();
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
