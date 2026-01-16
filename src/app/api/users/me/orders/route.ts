import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';
import Product from '@/lib/db/models/Product';
import { getUser } from '@/lib/auth/getUser';
import mongoose from 'mongoose';

function isValidObjectId(value: unknown): value is string {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

export const GET = handleApi(async (_req: NextRequest) => {
  const authUser = await getUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDB();

  try {
    // Convert string ID to ObjectId for querying
    const userObjectId = new mongoose.Types.ObjectId(authUser.id);

    const orders = await Order.find({
      userId: userObjectId,
      status: { $in: ['paid', 'shipped'] },
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (orders.length === 0) {
      return NextResponse.json([]);
    }

    // Manually populate products to handle missing products gracefully
    const ordersWithProducts = await Promise.all(
      orders.map(async (order: any) => {
        const populatedProducts = await Promise.all(
          order.products.map(async (p: any) => {
            try {
              const productIdRaw = p.productId;

              const productIdStr =
                typeof productIdRaw === 'string'
                  ? productIdRaw
                  : productIdRaw?._id?.toString?.() || productIdRaw?.toString?.();

              const canFetchFromDb = isValidObjectId(productIdStr);

              const product = canFetchFromDb ? await Product.findById(productIdStr).lean() : null;

              if (product) {
                return {
                  product: {
                    id: product._id.toString(),
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    images: product.images || [],
                    volume: p.volume || product.volume,
                    unit: p.unit || product.properties?.get('unit'),
                  },
                  quantity: p.quantity,
                };
              }

              // Fallback to snapshot stored in order
              if (!p?.slug && !p?.title) return null;

              return {
                product: {
                  id: productIdStr || '',
                  name: p.title || 'Unknown product',
                  slug: p.slug || '',
                  price: p.price || 0,
                  images: p.imageSrc ? [p.imageSrc] : [],
                  volume: p.volume,
                  unit: p.unit,
                },
                quantity: p.quantity,
              };
            } catch {
              return null;
            }
          }),
        );

        return {
          id: order._id.toString(),
          status: order.status,
          subtotal: order.subtotal,
          totalPrice: order.totalPrice || 0,
          promoCode: order.promoCode,
          discount: order.discount,
          promoDiscount: order.promoDiscount,
          createdAt: order.createdAt,
          products: populatedProducts.filter((p) => p !== null),
        };
      }),
    );

    return NextResponse.json(ordersWithProducts);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 },
    );
  }
});
