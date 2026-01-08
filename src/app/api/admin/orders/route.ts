import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async () => {
  // TODO: Implement fetching orders from DB
  return NextResponse.json([]);
});
