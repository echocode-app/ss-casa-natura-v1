import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const POST = handleApi(async (req: Request) => {
  // TODO: Implement registration logic
  const body = await req.json();
  // Mock response
  return NextResponse.json({ user: { id: 'user-new', email: body.email } });
});
