import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const POST = handleApi(async (req: Request) => {
  // TODO: Implement Stripe webhook handling
  await req.json();
  return NextResponse.json({ received: true });
});
