import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import Product, { IProduct } from '@/lib/db/models/Product';
import { log } from '@/lib/utils/logger';

interface Params {
  slug: string;
}

export async function GET(req: NextRequest, context: { params: Promise<Params> }) {
  const { slug } = await context.params;

  try {
    await connectToDB();

    const product = (await Product.findOne({ slug }).populate('upsellProducts')) as IProduct & {
      upsellProducts: IProduct[];
    };

    if (!product) {
      log('error', `Product not found for upsell: ${slug}`);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const upsell = (product.upsellProducts || []).map((p: IProduct) => {
      let finalPrice = p.price;
      if (p.promoPrice) finalPrice = p.promoPrice;
      if (p.seasonalDiscount) finalPrice = finalPrice - (p.seasonalDiscount / 100) * finalPrice;

      return { ...p.toObject(), finalPrice };
    });

    return NextResponse.json(upsell);
  } catch (error: any) {
    log('error', 'Error fetching upsell products', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
