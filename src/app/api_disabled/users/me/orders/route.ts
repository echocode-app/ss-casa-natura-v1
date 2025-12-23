import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/utils/logger';
import { handleApi } from '@/lib/utils/handleApi';

const handler = handleApi(async (req: NextRequest) => {
  await connectToDB();

  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload: any = jwt.verify(token, process.env.JWT_SECRET!);

  const orders = await Order.find({ userId: payload.id })
    .populate('products.productId', 'name price sku')
    .sort({ createdAt: -1 })
    .lean();

  log('success', `Fetched orders for user: ${payload.id}`);
  return NextResponse.json(orders);
});

export const GET = handler;
