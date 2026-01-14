import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';

export const GET = handleApi(async (req: Request) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || 50)));
  const skip = Math.max(0, Number(url.searchParams.get('skip') || 0));

  const orders = await Order.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

  return NextResponse.json({ success: true, orders });
});
