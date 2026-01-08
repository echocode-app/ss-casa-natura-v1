import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async () => {
  // TODO: Test DB connection
  return NextResponse.json({ status: 'DB connected' });
});
