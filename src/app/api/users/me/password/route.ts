import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const POST = handleApi(async (req: Request) => {
  // TODO: Implement password change
  const _body = await req.json();
  return NextResponse.json({ message: 'Password changed' });
});
