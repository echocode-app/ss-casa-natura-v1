import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';
import { log } from '@/lib/utils/logger';
import { adminAuth } from '@/lib/utils/adminAuth';

const handler = async (req: NextRequest, _context: any) => {
  await connectToDB();
  log('server', 'Connected to DB');

  if (req.method === 'GET') {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('products.productId', 'name price sku') // fetch product details
      .lean();
    log('success', 'Fetched all orders');
    return NextResponse.json(orders);
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
};

export const GET = adminAuth(handler);
