import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async () => {
  // TODO: Implement fetching promocodes from DB
  return NextResponse.json([]);
});

export const POST = handleApi(async (req: Request) => {
  // TODO: Implement creating promocode
  const body = await req.json();
  return NextResponse.json({ id: 'promo-1', ...body });
});
