import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import Product from '@/lib/db/models/Product';
import { log } from '@/lib/utils/logger';

interface Params {
  slug: string;
}

export async function GET(req: NextRequest, context: { params: Promise<Params> }) {
  const { slug } = await context.params;

  try {
    await connectToDB();

    const product = await Product.findOne({ slug })
      .populate('relatedProducts')
      .populate('upsellProducts');

    if (!product) {
      log('error', `Product not found: ${slug}`);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let finalPrice = product.price;
    if (product.promoPrice) finalPrice = product.promoPrice;
    if (product.seasonalDiscount)
      finalPrice = finalPrice - (product.seasonalDiscount / 100) * finalPrice;

    return NextResponse.json({
      ...product.toObject(),
      finalPrice,
    });
  } catch (error: any) {
    log('error', 'Error fetching product', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
