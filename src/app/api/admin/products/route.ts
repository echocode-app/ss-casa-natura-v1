import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async () => {
  // TODO: Implement fetching products from DB
  return NextResponse.json([]);
});

export const POST = handleApi(async (req: Request) => {
  // TODO: Implement creating product
  const body = await req.json();
  return NextResponse.json({ id: 'prod-new', ...body });
});
