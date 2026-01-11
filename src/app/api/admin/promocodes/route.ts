import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const GET = handleApi(async () => {
  const authError = await requireAdmin();
  if (authError) return authError;

  return NextResponse.json([]);
});

export const POST = handleApi(async (req: Request) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  return NextResponse.json({ id: 'promo-1', ...body });
});
