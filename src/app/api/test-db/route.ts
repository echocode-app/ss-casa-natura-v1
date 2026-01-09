import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';

export const GET = handleApi(async () => {
  // Test actual DB connection
  await connectToDB();
  return NextResponse.json({ status: 'DB connected successfully' });
});
