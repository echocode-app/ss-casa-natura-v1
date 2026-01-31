import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdminSection } from '@/lib/auth/requireAdmin';

export const GET = handleApi(async () => {
  const authError = await requireAdminSection('access');
  if (authError) return authError;

  return NextResponse.json([]);
});
