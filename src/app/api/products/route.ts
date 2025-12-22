import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import Product from '@/lib/db/models/Product';
import { log } from '@/lib/utils/logger';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async (req: NextRequest) => {
  await connectToDB();

  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const sort = url.searchParams.get('sort'); // 'popularity' або 'price'

  let query: any = {};
  if (category) query.category = category;

  let productsQuery = Product.find(query);

  // Sorting
  if (sort === 'popularity') {
    productsQuery = productsQuery.sort({ popularity: -1 });
  } else if (sort === 'price') {
    productsQuery = productsQuery.sort({ promoPrice: 1 });
  }

  const products = await productsQuery.exec();

  // Apply promo/discount
  const result = products.map((p) => {
    let finalPrice = p.price;
    if (p.promoPrice) finalPrice = p.promoPrice;
    if (p.seasonalDiscount) finalPrice = finalPrice - (p.seasonalDiscount / 100) * finalPrice;

    return {
      ...p.toObject(),
      finalPrice,
    };
  });

  log('success', `Fetched ${result.length} products`);
  return NextResponse.json(result);
});
