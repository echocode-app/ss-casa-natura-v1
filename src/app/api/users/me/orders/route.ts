import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';
import { getUser } from '@/lib/auth/getUser';

export const GET = handleApi(async (_req: NextRequest) => {
  const authUser = await getUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDB();

  const orders = await Order.find({ userId: authUser.id })
    .sort({ createdAt: -1 })
    .populate('products.productId')
    .lean()
    .exec();

  return NextResponse.json(
    orders.map((order: any) => ({
      id: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      products: order.products.map((p: any) => ({
        product: p.productId,
        quantity: p.quantity,
      })),
    })),
  );
});
