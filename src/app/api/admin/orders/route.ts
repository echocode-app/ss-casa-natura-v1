import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const GET = handleApi(async () => {
  const authError = await requireAdmin();
  if (authError) return authError;

  return NextResponse.json([]);
});
