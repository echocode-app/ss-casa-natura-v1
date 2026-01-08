import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const POST = handleApi(async (req: Request) => {
  // TODO: Implement login logic
  const body = await req.json();
  // Mock response
  return NextResponse.json({ token: 'mock-jwt-token', user: { id: 'user-1', email: body.email } });
});
