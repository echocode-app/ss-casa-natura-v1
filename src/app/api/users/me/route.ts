import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async () => {
  // TODO: Implement getting current user
  return NextResponse.json({ id: 'user-1', email: 'user@example.com' });
});

export const PUT = handleApi(async (req: Request) => {
  // TODO: Implement updating user profile
  const body = await req.json();
  return NextResponse.json({ id: 'user-1', ...body });
});
