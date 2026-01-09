import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { clearAuthCookie } from '@/lib/auth/cookies';

export const runtime = 'nodejs';

export const POST = handleApi(async () => {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
});
