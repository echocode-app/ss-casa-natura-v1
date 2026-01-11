import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const POST = handleApi(async (req: Request) => {
  // 📌 Stripe webhook handling for payment notifications
  await req.json();
  return NextResponse.json({ received: true });
});
