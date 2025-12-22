import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';
import { log } from '@/lib/utils/logger';
import { adminAuth } from '@/lib/utils/adminAuth';

const handler = async (req: NextRequest, context: any) => {
  const { id } = context.params;
  await connectToDB();
  log('server', 'Connected to DB');

  if (req.method === 'PUT') {
    const { status } = await req.json();
    const allowedStatuses = ['pending', 'paid', 'shipped', 'canceled'];
    if (!allowedStatuses.includes(status)) {
      log('error', `Invalid status: ${status}`);
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true },
    );

    if (!order) {
      log('error', `Order not found: ${id}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    log('success', `Order status updated: ${order._id} → ${status}`);
    return NextResponse.json(order);
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
};

export const PUT = adminAuth(handler);
