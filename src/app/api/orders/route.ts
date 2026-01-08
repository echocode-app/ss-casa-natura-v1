import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const POST = handleApi(async (req: Request) => {
  // TODO: Implement order creation with Stripe
  const body = await req.json();
  return NextResponse.json({ orderId: 'order-new', ...body });
});
