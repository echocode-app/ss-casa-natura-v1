import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdminSection } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';

export const GET = handleApi(async (req: Request) => {
  const authError = await requireAdminSection('orders');
  if (authError) return authError;

  await connectToDB();

  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || 50)));
  const skip = Math.max(0, Number(url.searchParams.get('skip') || 0));

  const status = url.searchParams.get('status') || undefined;
  const q = (url.searchParams.get('q') || '').trim();
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;

  const query: any = {};
  if (status && ['pending', 'paid', 'shipped', 'canceled'].includes(status)) {
    query.status = status;
  }

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  if (q) {
    // Search by customer, checkoutId, payment intent
    query.$or = [
      { customerEmail: { $regex: q, $options: 'i' } },
      { customerName: { $regex: q, $options: 'i' } },
      { customerSurname: { $regex: q, $options: 'i' } },
      { checkoutId: { $regex: q, $options: 'i' } },
      { stripePaymentIntentId: { $regex: q, $options: 'i' } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  return NextResponse.json({ success: true, orders, total, limit, skip });
});
